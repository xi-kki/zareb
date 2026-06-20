from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.core.utils import gen_uuid


class ComplianceReport(Base):
    __tablename__ = "compliance_reports"

    id = Column(Text, primary_key=True, default=gen_uuid)
    user_id = Column(Text, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    document_id = Column(Text, ForeignKey("documents.id", ondelete="CASCADE"), nullable=False)
    standard = Column(String(20), nullable=False)
    overall_score = Column(Integer, nullable=False)
    gaps_found = Column(JSON, nullable=False, default=list)
    recommendations = Column(JSON, nullable=False, default=list)
    critical_issues = Column(JSON, nullable=False, default=list)
    export_specific_notes = Column(Text, nullable=True)
    audit_readiness = Column(String(20), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationship
    document = relationship("Document", backref="reports", lazy="selectin")

    def to_dict(self):
        return {
            "id": str(self.id),
            "user_id": str(self.user_id),
            "document_id": str(self.document_id),
            "standard": self.standard,
            "overall_score": self.overall_score,
            "gaps_found": self.gaps_found,
            "recommendations": self.recommendations,
            "critical_issues": self.critical_issues,
            "export_specific_notes": self.export_specific_notes,
            "audit_readiness": self.audit_readiness,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
