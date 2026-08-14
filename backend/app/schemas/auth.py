from typing import Optional
from pydantic import BaseModel, ConfigDict, model_validator


class LoginRequest(BaseModel):
    username: Optional[str] = None
    email: Optional[str] = None
    password: str

    @model_validator(mode="after")
    def validate_identifier(self):
        if not self.username and not self.email:
            raise ValueError("Username or email is required.")
        return self

    @property
    def identifier(self) -> str:
        return (self.username or self.email or "").strip()


class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    full_name: Optional[str] = None
    is_active: bool = True

    model_config = ConfigDict(from_attributes=True)


class MessageResponse(BaseModel):
    message: str

