import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, Boolean
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    company_name = Column(String(255), nullable=True)
    country = Column(String(100), nullable=False, default="Other")
    export_market = Column(String(10), nullable=False, default="EU")
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    def to_dict(self):
        return {
            "id": str(self.id),
            "email": self.email,
            "company_name": self.company_name,
            "country": self.country,
            "export_market": self.export_market,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
