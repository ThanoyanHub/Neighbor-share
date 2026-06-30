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
