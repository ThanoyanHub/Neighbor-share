from datetime import datetime
from pydantic import BaseModel, EmailStr, Field, field_validator
from app.models.enums import Role
PHONE_PATTERN = r'^\+?[0-9\-\s()]{7,20}$'

class UserBase(BaseModel):
    full_name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    phone_number: str = Field(pattern=PHONE_PATTERN)
    address: str = Field(min_length=5, max_length=250)

class UserCreate(UserBase):
    password: str = Field(min_length=8, max_length=128)
    @field_validator('password')
    @classmethod
    def validate_password(cls, value: str) -> str:
        if not any(c.isdigit() for c in value) or not any(c.isalpha() for c in value):
            raise ValueError('Password must contain at least one letter and one number')
        return value

class UserUpdate(BaseModel):
    full_name: str | None = Field(default=None, min_length=2, max_length=100)
    phone_number: str | None = Field(default=None, pattern=PHONE_PATTERN)
    address: str | None = Field(default=None, min_length=5, max_length=250)

class UserPublic(UserBase):
    id: str
    role: Role
    created_at: datetime
    updated_at: datetime
