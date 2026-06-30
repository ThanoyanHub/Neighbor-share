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



@router.put('/me', response_model=UserPublic)
async def update_me(payload: UserUpdate, current_user: dict = Depends(get_current_user), db: AsyncIOMotorDatabase = Depends(get_database)):
    updates = {k: v for k, v in payload.model_dump(exclude_unset=True).items() if v is not None}
    updates['updated_at'] = now_utc()
    await db.users.update_one({'_id': oid(current_user['id'])}, {'$set': updates})
    if 'full_name' in updates:
        user_id = oid(current_user['id'])
        await db.tools.update_many({'owner_id': user_id}, {'$set': {'owner_name': updates['full_name'], 'updated_at': updates['updated_at']}})
        await db.reservations.update_many({'owner_id': user_id}, {'$set': {'owner_name': updates['full_name'], 'updated_at': updates['updated_at']}})
        await db.reservations.update_many({'borrower_id': user_id}, {'$set': {'borrower_name': updates['full_name'], 'updated_at': updates['updated_at']}})
    return serialize_doc(await db.users.find_one({'_id': oid(current_user['id'])}))

