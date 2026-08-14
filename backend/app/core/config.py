import json
from typing import List, Union, Optional
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "AWS Route 53 Mini Clone"
    ENVIRONMENT: str = "development"
    SECRET_KEY: str = "supersecretkey-change-in-production-use-random-bytes"
    SQLITE_PATH: Optional[str] = None
    DATABASE_URL: str = "sqlite:///./route53.db"

    @field_validator("DATABASE_URL", mode="before")
    @classmethod
    def assemble_db_url(cls, v: Optional[str], info) -> str:
        # If SQLITE_PATH was provided in data, use it
        sqlite_path = info.data.get("SQLITE_PATH") if hasattr(info, "data") else None
        if sqlite_path:
            return f"sqlite:///{sqlite_path}"
        return v or "sqlite:///./route53.db"

    CORS_ORIGINS: Union[List[str], str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    # Mock Auth Configuration
    MOCK_USER_USERNAME: str = "admin"
    MOCK_USER_PASSWORD: str = "adminpassword123"
    MOCK_USER_EMAIL: str = "admin@example.com"
    SESSION_COOKIE_NAME: str = "route53_session"
    SESSION_EXPIRE_HOURS: int = 24

    # Pagination limits
    DEFAULT_PAGE_LIMIT: int = 20
    MAX_PAGE_LIMIT: int = 100

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str):
            if v.startswith("[") and v.endswith("]"):
                try:
                    return json.loads(v)
                except Exception:
                    pass
            return [i.strip() for i in v.split(",") if i.strip()]
        elif isinstance(v, (list, set)):
            return list(v)
        return ["http://localhost:3000", "http://127.0.0.1:3000"]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="allow",
    )


settings = Settings()
