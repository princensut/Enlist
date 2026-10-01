import uuid
import enum
from datetime import datetime, timezone
from sqlalchemy import String, Enum, DateTime, ForeignKey, JSON, UniqueConstraint, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base, TimestampMixin

class ApplicationStatus(str, enum.Enum):
    Pending = "Pending"
    Accepted = "Accepted"
    Rejected = "Rejected"

class Application(Base, TimestampMixin):
    __tablename__ = "applications"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    student_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    society_id: Mapped[str] = mapped_column(String(36), ForeignKey("societies.id", ondelete="CASCADE"), nullable=False, index=True)
    answers: Mapped[dict] = mapped_column(JSON, nullable=False)
    status: Mapped[ApplicationStatus] = mapped_column(Enum(ApplicationStatus), default=ApplicationStatus.Pending, nullable=False, index=True)
    submitted_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False, index=True)

    student: Mapped["User"] = relationship("User", back_populates="applications")
    society: Mapped["Society"] = relationship("Society", back_populates="applications")

    __table_args__ = (
        UniqueConstraint("student_id", "society_id", name="uq_student_society_application"),
        Index("idx_society_status", "society_id", "status"),
    )