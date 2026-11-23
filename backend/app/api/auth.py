from datetime import timedelta

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Request, Response
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.config import settings
from app.core.security import DUMMY_HASH, create_access_token, hash_password, hash_token, verify_password
from app.db.session import get_db
from app.models import RefreshToken, TokenType, User
from app.schemas.auth import (EmailIn, LoginIn, MessageOut, ResetPasswordIn, SignupIn, TokenIn, TokenOut, UserOut)
from app.services import auth as svc
from app.services.mail import send_reset_email, send_verification_email

router = APIRouter(prefix="/api/auth", tags=["auth"])
REFRESH_COOKIE = "refresh_token"
COOKIE_PATH = "/api/auth"


def _set_cookie(response: Response, raw: str) -> None:
    response.set_cookie(
        REFRESH_COOKIE, raw,
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 86400,
        httponly=True,
        secure=settings.APP_ENV == "production",
        samesite="lax",
        path=COOKIE_PATH,
    )


def _token_out(user: User) -> TokenOut:
    return TokenOut(
        access_token=create_access_token(user.id),
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user=UserOut.model_validate(user),
    )


def _queue_verification(db: Session, user: User, bg: BackgroundTasks) -> None:
    raw = svc.create_one_time_token(
        db, user, TokenType.EMAIL_VERIFICATION, timedelta(hours=settings.VERIFY_TOKEN_EXPIRE_HOURS)
    )
    bg.add_task(send_verification_email, user.email, user.full_name, raw)


@router.post("/signup", response_model=MessageOut, status_code=201)
def signup(data: SignupIn, bg: BackgroundTasks, db: Session = Depends(get_db)):
    msg = MessageOut(message="Compte créé. Vérifiez votre boîte mail pour activer votre espace.")
    email = data.email.lower()
    if db.scalar(select(User).where(User.email == email)):
        return msg
    user = User(
        full_name=data.full_name.strip(), shop_name=data.shop_name.strip(),
        email=email, password_hash=hash_password(data.password),
    )
    db.add(user)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        return msg
    db.refresh(user)
    _queue_verification(db, user, bg)
    return msg


@router.post("/verify-email", response_model=MessageOut)
def verify_email(data: TokenIn, db: Session = Depends(get_db)):
    user = svc.consume_one_time_token(db, data.token, TokenType.EMAIL_VERIFICATION)
    if not user:
        raise HTTPException(400, "Lien invalide ou expiré.")
    user.is_email_verified = True
    db.commit()
    return MessageOut(message="E-mail vérifié.")


@router.post("/resend-verification", response_model=MessageOut)
def resend_verification(data: EmailIn, bg: BackgroundTasks, db: Session = Depends(get_db)):
    user = db.scalar(select(User).where(User.email == data.email.lower()))
    if user and user.is_active and not user.is_email_verified:
        _queue_verification(db, user, bg)
    return MessageOut(message="Si un compte correspond, un nouveau lien a été envoyé.")


@router.post("/login", response_model=TokenOut)
def login(data: LoginIn, request: Request, response: Response, db: Session = Depends(get_db)):
    user = db.scalar(select(User).where(User.email == data.email.lower()))
    if not user:
        verify_password(DUMMY_HASH, data.password)
        raise HTTPException(401, "Email ou mot de passe incorrect.")
    if not verify_password(user.password_hash, data.password) or not user.is_active:
        raise HTTPException(401, "Email ou mot de passe incorrect.")
    if not user.is_email_verified:
        raise HTTPException(403, detail={"code": "email_not_verified",
                                         "message": "Veuillez vérifier votre e-mail avant de vous connecter."})
    user.last_login_at = svc.now()
    raw = svc.issue_refresh_token(db, user, request)
    db.commit()
    _set_cookie(response, raw)
    return _token_out(user)


@router.post("/refresh", response_model=TokenOut)
def refresh(request: Request, response: Response, db: Session = Depends(get_db)):
    unauth = HTTPException(401, "Session expirée.")
    raw = request.cookies.get(REFRESH_COOKIE)
    if not raw:
        raise unauth
    rt = db.scalar(select(RefreshToken).where(RefreshToken.token_hash == hash_token(raw)))
    if not rt:
        raise unauth
    now = svc.now()
    if rt.revoked_at:
        if now - rt.revoked_at > timedelta(seconds=10):  # rejeu suspect → on coupe toute la famille
            svc.revoke_family(db, rt.family_id)
            db.commit()
        raise unauth
    user = rt.user
    if rt.expires_at <= now or not user.is_active or not user.is_email_verified:
        raise unauth
    rt.revoked_at = now
    new_raw = svc.issue_refresh_token(db, user, request, family_id=rt.family_id)
    db.commit()
    _set_cookie(response, new_raw)
    return _token_out(user)


@router.post("/logout", response_model=MessageOut)
def logout(request: Request, response: Response, db: Session = Depends(get_db)):
    raw = request.cookies.get(REFRESH_COOKIE)
    if raw:
        rt = db.scalar(select(RefreshToken).where(RefreshToken.token_hash == hash_token(raw)))
        if rt and not rt.revoked_at:
            rt.revoked_at = svc.now()
            db.commit()
    response.delete_cookie(REFRESH_COOKIE, path=COOKIE_PATH)
    return MessageOut(message="Déconnecté.")


@router.post("/forgot-password", response_model=MessageOut)
def forgot_password(data: EmailIn, bg: BackgroundTasks, db: Session = Depends(get_db)):
    user = db.scalar(select(User).where(User.email == data.email.lower()))
    if user and user.is_active:
        raw = svc.create_one_time_token(
            db, user, TokenType.PASSWORD_RESET, timedelta(minutes=settings.RESET_TOKEN_EXPIRE_MINUTES)
        )
        bg.add_task(send_reset_email, user.email, user.full_name, raw)
    return MessageOut(message="Si un compte correspond, un lien a été envoyé.")


@router.post("/reset-password", response_model=MessageOut)
def reset_password(data: ResetPasswordIn, db: Session = Depends(get_db)):
    user = svc.consume_one_time_token(db, data.token, TokenType.PASSWORD_RESET)
    if not user:
        raise HTTPException(400, "Lien invalide ou expiré.")
    user.password_hash = hash_password(data.password)
    user.is_email_verified = True
    svc.revoke_all_user_tokens(db, user.id)
    db.commit()
    return MessageOut(message="Mot de passe réinitialisé.")


@router.get("/me", response_model=UserOut)
def me(user: User = Depends(get_current_user)):
    return user