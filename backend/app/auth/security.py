from datetime import datetime, timedelta, timezone
from typing import Any
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
import bcrypt
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.config.settings import get_settings
from app.database.mongo import get_database
from app.database.object_id import serialize_doc
from app.models.enums import Role

oauth2_scheme = OAuth2PasswordBearer(tokenUrl='/auth/login')

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed_password.encode('utf-8'))

def create_token(subject: str, token_type: str, secret: str, expires_delta: timedelta) -> str:
    expire = datetime.now(timezone.utc) + expires_delta
    return jwt.encode({'sub': subject, 'type': token_type, 'exp': expire}, secret, algorithm='HS256')

def create_access_token(user_id: str) -> str:
    settings = get_settings()
    return create_token(user_id, 'access', settings.jwt_secret_key, timedelta(minutes=settings.access_token_expire_minutes))

def create_refresh_token(user_id: str) -> str:
    settings = get_settings()
    return create_token(user_id, 'refresh', settings.jwt_refresh_secret_key, timedelta(days=settings.refresh_token_expire_days))

def decode_token(token: str, secret: str, expected_type: str) -> str:
    credentials_error = HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Invalid or expired token')
    try:
        payload: dict[str, Any] = jwt.decode(token, secret, algorithms=['HS256'])
        if payload.get('type') != expected_type or not payload.get('sub'):
            raise credentials_error
        return str(payload['sub'])
    except JWTError as exc:
        raise credentials_error from exc

async def get_current_user(token: str = Depends(oauth2_scheme), db: AsyncIOMotorDatabase = Depends(get_database)) -> dict:
    user_id = decode_token(token, get_settings().jwt_secret_key, 'access')
    from app.database.object_id import oid
    user = await db.users.find_one({'_id': oid(user_id)})
    if not user:
        raise HTTPException(status_code=401, detail='User not found')
    return serialize_doc(user)

def require_admin(current_user: dict = Depends(get_current_user)) -> dict:
    if current_user['role'] != Role.ADMIN:
        raise HTTPException(status_code=403, detail='Admin access required')
    return current_user
