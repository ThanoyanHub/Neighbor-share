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