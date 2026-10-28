from functools import lru_cache
from typing import Optional

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "TokenTrap API"
    app_version: str = "1.0.0"
    environment: str = "development"

    genuine_jwt_secret: str
    decoy_jwt_secret: str

    genuine_jwt_issuer: str = "tokentrap-auth"
    genuine_jwt_audience: str = "tokentrap-admin"

    decoy_jwt_issuer: str = "tokentrap-deception"
    decoy_jwt_audience: str = "tokentrap-decoy"

    # Genuine administrator account
    admin_email: Optional[str] = None
    admin_password_hash: Optional[str] = None

    # Separate decoy account
    decoy_email: Optional[str] = None
    decoy_password_hash: Optional[str] = None

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
