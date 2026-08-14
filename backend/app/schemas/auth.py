from typing import Optional
from pydantic import BaseModel, ConfigDict


class LoginRequest(BaseModel):
    username: str
    password: str


class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    full_name: Optional[str] = None
    is_active: bool = True

    model_config = ConfigDict(from_attributes=True)


class MessageResponse(BaseModel):
    message: str
