from typing import Optional

from pydantic import BaseModel, EmailStr, field_validator

from app.core.config import ACCESS_TOKEN_TTL


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class GoogleLoginRequest(BaseModel):
    access_token: str


class RefreshRequest(BaseModel):
    refresh_token: str


class SwitchTontineRequest(BaseModel):
    tontine_id: int
    refresh_token: Optional[str] = None


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int = ACCESS_TOKEN_TTL * 60
    user: dict


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str

    @field_validator("new_password")
    @classmethod
    def strong(cls, value):
        if len(value) < 8:
            raise ValueError("Le mot de passe doit contenir au moins 8 caractères")
        return value

