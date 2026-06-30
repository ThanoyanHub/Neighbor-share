from fastapi import APIRouter, Depends, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase
from pymongo.errors import DuplicateKeyError
from app.auth.security import create_access_token, create_refresh_token, decode_token, get_current_user, hash_password, verify_password
from app.config.settings import get_settings
from app.database.mongo import get_database
from app.database.object_id import oid, serialize_doc
from app.models.common import now_utc
from app.models.enums import Role
from app.schemas.auth import AuthResponse, LoginRequest, RefreshRequest, TokenPair
from app.schemas.users import UserCreate, UserPublic, UserUpdate