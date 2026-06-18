from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, DateTime, ForeignKey
from app.core.database import Base
from app.core.utils import gen_uuid


class Document(Base):
    __tablename__ = "documents"

    id = Column(Text, primary_key=True, default=gen_uuid)
    user_id = Column(Text, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    filename = Column(String(255), nullable=False)
    doc_type = Column(String(20), nullable=False)
    cloudinary_url = Column(Text, nullable=False)
    parsed_text = Column(Text, nullable=True)
    upload_date = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    status = Column(String(20), nullable=False, default="pending")

    def to_dict(self):
        return {
            "id": str(self.id),
            "user_id": str(self.user_id),
            "filename": self.filename,
            "doc_type": self.doc_type,
            "cloudinary_url": self.cloudinary_url,
            "upload_date": self.upload_date.isoformat() if self.upload_date else None,
            "status": self.status,
        }
