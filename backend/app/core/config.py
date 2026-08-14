import json
from typing import List, Union, Optional
from pydantic import field_validator, AliasChoices, Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "AWS Route 53 Mini Clone"
    ENVIRONMENT: str = "development"
    SECRET_KEY: str = Field(
        default="supersecretkey-change-in-production-use-random-bytes",
        validation_alias=AliasChoices("SECRET_KEY", "JWT_SECRET", "AUTH_SECRET"),
    )
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
    CORS_ORIGIN_REGEX: Optional[str] = None

    # Mock Auth Configuration
    MOCK_USER_USERNAME: str = Field(
        default="admin",
        validation_alias=AliasChoices(
            "MOCK_USER_USERNAME",
            "ADMIN_USERNAME",
            "MOCK_USERNAME",
            "ADMIN_USER",
            "ROUTE53_USERNAME",
        ),
    )
    MOCK_USER_PASSWORD: str = Field(
        default="adminpassword123",
        validation_alias=AliasChoices(
            "MOCK_USER_PASSWORD",
            "ADMIN_PASSWORD",
            "MOCK_PASSWORD",
            "ROUTE53_PASSWORD",
        ),
    )
    MOCK_USER_EMAIL: str = Field(
        default="admin@example.com",
        validation_alias=AliasChoices(
            "MOCK_USER_EMAIL",
            "ADMIN_EMAIL",
            "MOCK_EMAIL",
            "ROUTE53_EMAIL",
        ),
    )
    SESSION_COOKIE_NAME: str = "route53_session"
    SESSION_EXPIRE_HOURS: int = 24
    COOKIE_SAMESITE: Optional[str] = None
    COOKIE_SECURE: Optional[bool] = None

    # Pagination limits
    DEFAULT_PAGE_LIMIT: int = 20
    MAX_PAGE_LIMIT: int = 100

    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT.lower() in ("production", "prod")

    @property
    def cookie_samesite(self) -> str:
        if self.COOKIE_SAMESITE:
            return self.COOKIE_SAMESITE.lower()
        return "none" if self.is_production else "lax"

    @property
    def cookie_secure(self) -> bool:
        if self.COOKIE_SECURE is not None:
            return self.COOKIE_SECURE
        return True if (self.is_production or self.cookie_samesite == "none") else False

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        origins: List[str] = []
        if isinstance(v, str):
            if v.strip() == "*":
                return ["*"]
            if v.startswith("[") and v.endswith("]"):
                try:
                    raw_list = json.loads(v)
                    origins = [str(i).strip().rstrip("/") for i in raw_list if str(i).strip()]
                except Exception:
                    pass
            if not origins:
                origins = [i.strip().rstrip("/") for i in v.split(",") if i.strip()]
        elif isinstance(v, (list, set)):
            origins = [str(i).strip().rstrip("/") for i in v if str(i).strip()]
        else:
            origins = ["http://localhost:3000", "http://127.0.0.1:3000"]

        # Ensure both localhost and common defaults exist if not already present
        clean_origins = []
        for o in origins:
            if o and o not in clean_origins:
                clean_origins.append(o)
                # Also support with or without trailing slash just in case
        return clean_origins

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="allow",
    )


settings = Settings()
