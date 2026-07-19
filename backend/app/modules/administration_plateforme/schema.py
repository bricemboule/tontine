from datetime import date
from typing import Optional

from pydantic import BaseModel, EmailStr, field_validator


class CreationOrganisation(BaseModel):
    name: str
    slug: Optional[str] = None
    logo: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    city: Optional[str] = None
    country: Optional[str] = "Cameroun"
    address: Optional[str] = None

    @field_validator("name")
    @classmethod
    def valid_name(cls, value: str) -> str:
        value = value.strip()
        if len(value) < 2:
            raise ValueError("Le nom de l'organisation est requis")
        return value


class ModificationStatutOrganisation(BaseModel):
    status: str


class CreationTontine(BaseModel):
    name: str
    admin_user_id: int
    organization_id: Optional[int] = None
    description: Optional[str] = None
    type: str = "mixte"
    contribution_amount: float = 50000
    frequency: str = "monthly"
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    max_members: int = 20


class ModificationTontine(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    type: Optional[str] = None
    contribution_amount: Optional[float] = None
    frequency: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    max_members: Optional[int] = None
    status: Optional[str] = None


class CreateAdminRequest(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    phone: str

    @field_validator("first_name", "last_name", "phone")
    @classmethod
    def required_text(cls, value):
        value = value.strip()
        if not value:
            raise ValueError("Ce champ est requis")
        return value


OrganizationCreate = CreationOrganisation
OrganizationStatusUpdate = ModificationStatutOrganisation
TontineCreateMVP = CreationTontine
TontineUpdateMVP = ModificationTontine
