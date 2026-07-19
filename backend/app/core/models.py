"""Modèles centraux et enums partagés par l'API TontineOS."""
import enum
import uuid

from sqlalchemy import (
    BigInteger, Boolean, Column, DateTime, Enum as SAEnum,
    ForeignKey, JSON, String, UniqueConstraint, func,
)
from sqlalchemy.orm import DeclarativeBase


class UserRole(str, enum.Enum):
    SUPERADMIN = "superadmin"
    ADMIN = "admin"
    PRESIDENT = "president"
    SECRETAIRE = "secretaire"
    TRESORIER = "tresorier"
    CENSEUR = "censeur"
    MEMBRE = "membre"


class TontineType(str, enum.Enum):
    ROTATION = "rotation"
    CREDIT = "credit"
    MIXTE = "mixte"


class TontineStatus(str, enum.Enum):
    DRAFT = "draft"
    ACTIVE = "active"
    PAUSE = "pause"
    TERMINE = "termine"


class PaymentMethod(str, enum.Enum):
    ORANGE_MONEY = "orange_money"
    MTN_MOMO = "mtn_momo"
    VIREMENT = "virement"
    ESPECES = "especes"


class SanctionStatus(str, enum.Enum):
    PENDING_PRESIDENT = "pending_president"
    ACTIVE = "active"
    LIFTED = "lifted"
    REJECTED = "rejected"


class Base(DeclarativeBase):
    pass


def enum_column(enum_cls: type[enum.Enum]) -> SAEnum:
    return SAEnum(
        enum_cls,
        values_callable=lambda enum_type: [member.value for member in enum_type],
        native_enum=False,
        validate_strings=True,
    )


class User(Base):
    __tablename__ = "users"
    id = Column(BigInteger, primary_key=True, autoincrement=True)
    uuid = Column(String(36), unique=True, nullable=False, default=lambda: str(uuid.uuid4()))
    email = Column(String(255), unique=True, nullable=False, index=True)
    phone = Column(String(20), unique=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    global_role = Column(enum_column(UserRole), default=UserRole.MEMBRE, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    is_verified = Column(Boolean, default=False)
    notification_prefs = Column(JSON, default=lambda: {"sms": True, "email": True, "whatsapp": False})
    last_login = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"


class TontineRegistry(Base):
    __tablename__ = "tontine_registry"
    id = Column(BigInteger, primary_key=True, autoincrement=True)
    uuid = Column(String(36), unique=True, nullable=False, default=lambda: str(uuid.uuid4()))
    name = Column(String(200), nullable=False)
    slug = Column(String(100), unique=True, nullable=False)
    schema_name = Column(String(100), unique=True, nullable=False)
    type = Column(enum_column(TontineType), nullable=False)
    status = Column(enum_column(TontineStatus), default=TontineStatus.DRAFT)
    currency = Column(String(5), default="XAF")
    created_by = Column(BigInteger, ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class TontineAdminAssignment(Base):
    """1 admin ne peut gérer qu'une seule tontine (contrainte unique double)."""
    __tablename__ = "tontine_admin_assignments"
    __table_args__ = (
        UniqueConstraint("user_id", name="uq_one_tontine_per_admin"),
        UniqueConstraint("tontine_id", name="uq_one_admin_per_tontine"),
    )
    id = Column(BigInteger, primary_key=True, autoincrement=True)
    user_id = Column(BigInteger, ForeignKey("users.id"), nullable=False)
    tontine_id = Column(BigInteger, ForeignKey("tontine_registry.id"), nullable=False)
    assigned_at = Column(DateTime(timezone=True), server_default=func.now())


class TontineMember(Base):
    """Lien entre un user et une tontine avec son rôle bureau."""
    __tablename__ = "tontine_members"
    __table_args__ = (
        UniqueConstraint("user_id", "tontine_id", name="uq_member_per_tontine"),
    )
    id = Column(BigInteger, primary_key=True, autoincrement=True)
    user_id = Column(BigInteger, ForeignKey("users.id"), nullable=False)
    tontine_id = Column(BigInteger, ForeignKey("tontine_registry.id"), nullable=False)
    role = Column(enum_column(UserRole), default=UserRole.MEMBRE, nullable=False)
    status = Column(String(20), default="pending")
    joined_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class AuditLog(Base):
    __tablename__ = "audit_logs"
    id = Column(BigInteger, primary_key=True, autoincrement=True)
    user_id = Column(BigInteger, ForeignKey("users.id"))
    tontine_slug = Column(String(100))
    action = Column(String(100), nullable=False)
    resource = Column(String(100), nullable=False)
    resource_id = Column(String(100))
    details = Column(JSON)
    ip_address = Column(String(45))
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)


class RefreshToken(Base):
    """Refresh tokens révocables : rotation + détection de réutilisation."""
    __tablename__ = "refresh_tokens"
    id = Column(BigInteger, primary_key=True, autoincrement=True)
    jti = Column(String(36), unique=True, nullable=False, index=True)
    user_id = Column(BigInteger, ForeignKey("users.id"), nullable=False, index=True)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    revoked_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
