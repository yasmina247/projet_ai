import uuid
from datetime import datetime, timedelta, timezone

from fastapi import Request
from sqlalchemy import select, update
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import hash_token, new_raw_token
from app.models import OneTimeToken, RefreshToken, TokenType, User


def now() -> datetime:
    return datetime.now(timezone.utc)


def create_one_time_token(db: Session, user: User, ttype: TokenType, ttl: timedelta) -> str:
    db.execute(
        update(OneTimeToken)
        .where(OneTimeToken.user_id == user.id, OneTimeToken.type == ttype, OneTimeToken.used_at.is_(None))
        .values(used_at=now())
    )
    raw = new_raw_token()
    db.add(OneTimeToken(user_id=user.id, type=ttype, token_hash=hash_token(raw), expires_at=now() + ttl))
    db.commit()
    return raw


def consume_one_time_token(db: Session, raw: str, ttype: TokenType) -> User | None:
    t = db.scalar(
        select(OneTimeToken).where(OneTimeToken.token_hash == hash_token(raw), OneTimeToken.type == ttype)
    )
    if not t or t.used_at or t.expires_at <= now():
        return None
    t.used_at = now()
    return t.user  # l'appelant fait le commit


def issue_refresh_token(db: Session, user: User, request: Request, family_id: uuid.UUID | None = None) -> str:
    raw = new_raw_token()
    db.add(
        RefreshToken(
            user_id=user.id,
            token_hash=hash_token(raw),
            family_id=family_id or uuid.uuid4(),
            expires_at=now() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
            user_agent=(request.headers.get("user-agent") or "")[:255],
            ip_address=request.client.host if request.client else None,
        )
    )
    return raw  # l'appelant fait le commit


def revoke_family(db: Session, family_id: uuid.UUID) -> None:
    db.execute(
        update(RefreshToken)
        .where(RefreshToken.family_id == family_id, RefreshToken.revoked_at.is_(None))
        .values(revoked_at=now())
    )


def revoke_all_user_tokens(db: Session, user_id: uuid.UUID) -> None:
    db.execute(
        update(RefreshToken)
        .where(RefreshToken.user_id == user_id, RefreshToken.revoked_at.is_(None))
        .values(revoked_at=now())
    )