from functools import lru_cache
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    app_name: str = 'NeighborShare API'
    environment: str = 'development'
    mongodb_uri: str
    mongodb_db: str = 'neighborshare'
    jwt_secret_key: str
    jwt_refresh_secret_key: str
    access_token_expire_minutes: int = 30
    refresh_token_expire_days: int = 7
    allowed_origins: str = Field(default='http://localhost:5173')
    model_config = SettingsConfigDict(env_file='.env', env_file_encoding='utf-8')
    @property
    def cors_origins(self) -> list[str]:
        return [o.strip() for o in self.allowed_origins.split(',') if o.strip()]