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

router = APIRouter(prefix='/auth', tags=['Authentication'])

def public_user(user: dict) -> UserPublic:
    return UserPublic(**serialize_doc(user))

@router.post('/register', response_model=AuthResponse, status_code=201)
async def register(payload: UserCreate, db: AsyncIOMotorDatabase = Depends(get_database)):
    now = now_utc()
    user = payload.model_dump(exclude={'password'})
    user.update({'email': payload.email.lower(), 'hashed_password': hash_password(payload.password), 'role': Role.USER, 'created_at': now, 'updated_at': now})
    try:
        result = await db.users.insert_one(user)
    except DuplicateKeyError as exc:
        raise HTTPException(status_code=409, detail='Email is already registered') from exc
    created = await db.users.find_one({'_id': result.inserted_id})
    uid = str(result.inserted_id)
    return AuthResponse(access_token=create_access_token(uid), refresh_token=create_refresh_token(uid), user=public_user(created))

@router.post('/login', response_model=AuthResponse)
async def login(payload: LoginRequest, db: AsyncIOMotorDatabase = Depends(get_database)):
    user = await db.users.find_one({'email': payload.email.lower()})
    if not user or not verify_password(payload.password, user['hashed_password']):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Invalid email or password')
    uid = str(user['_id'])
    return AuthResponse(access_token=create_access_token(uid), refresh_token=create_refresh_token(uid), user=public_user(user))

@router.post('/refresh', response_model=TokenPair)
async def refresh(payload: RefreshRequest):
    uid = decode_token(payload.refresh_token, get_settings().jwt_refresh_secret_key, 'refresh')
    return TokenPair(access_token=create_access_token(uid), refresh_token=create_refresh_token(uid))


@router.get('/me', response_model=UserPublic)
async def me(current_user: dict = Depends(get_current_user)):
    return current_user
