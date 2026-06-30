from pydantic import BaseModel, EmailStr
from app.schemas.users import UserPublic

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenPair(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = 'bearer'

class AuthResponse(TokenPair):
    user: UserPublic

class RefreshRequest(BaseModel):
    refresh_token: str
