from typing import Optional

from pydantic import BaseModel

from app.core.models import UserRole


class MemberCreate(BaseModel):
    first_name: str
    last_name: str
    phone: str
    email: Optional[str] = None
    photo: Optional[str] = None
    profession: Optional[str] = None
    address: Optional[str] = None
    role: UserRole = UserRole.MEMBRE


class MemberUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    photo: Optional[str] = None
    profession: Optional[str] = None
    address: Optional[str] = None
    role: Optional[UserRole] = None
    status: Optional[str] = None


class OffboardMember(BaseModel):
    reason: str = "Départ du membre"
    force: bool = False


MemberCreateMVP = MemberCreate
MemberUpdateMVP = MemberUpdate
OffboardMemberMVP = OffboardMember
