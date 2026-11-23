import uuid

from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.security import decode_access_token
from app.db.session import get_db
from app.models import User

bearer = HTTPBearer(auto_error=False)


def get_current_user(
    creds: HTTPAuthorizationCredentials | None = Depends(bearer),
    db: Session = Depends(get_db),
) -> User:
    err = HTTPException(401, "Non authentifié.", headers={"WWW-Authenticate": "Bearer"})
    if not creds:
        raise err
    uid = decode_access_token(creds.credentials)
    if not uid:
        raise err
    try:
        user = db.get(User, uuid.UUID(uid))
    except ValueError:
        raise err
    if not user or not user.is_active or not user.is_email_verified:
        raise err
    return user