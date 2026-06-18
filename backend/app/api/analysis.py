from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.models.document import Document
from app.models.report import ComplianceReport
from app.services.ai_service import ai_service
from app.api.auth import get_current_user
from app.models.user import User

router = APIRouter(prefix="/api/analyze", tags=["analysis"])

VALID_STANDARDS = {"FSMA", "HACCP", "SQF", "BRCGS", "ISO22000", "NAFDAC", "KEBS", "FDA_EU"}


class AnalyzeRequest(BaseModel):
    standard: str


@router.post("/{document_id}")
async def analyze_document(
    document_id: str,
    request: AnalyzeRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    if request.standard not in VALID_STANDARDS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid standard. Must be one of: {', '.join(VALID_STANDARDS)}",
        )

    # Fetch document
    result = await db.execute(
        select(Document).where(Document.id == document_id, Document.user_id == user.id)
    )
    doc = result.scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")

    if not doc.parsed_text:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Document has no extracted text")

    # Run analysis via AI service
    try:
        analysis = await ai_service.analyze_document(doc.parsed_text, request.standard)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=f"Analysis failed: {str(e)}")

    # Save report
    report = ComplianceReport(
        user_id=user.id,
        document_id=doc.id,
        standard=request.standard,
        overall_score=analysis.get("overall_score", 0),
        gaps_found=analysis.get("gaps_found", []),
        recommendations=analysis.get("recommendations", []),
        critical_issues=analysis.get("critical_issues", []),
        export_specific_notes=analysis.get("export_specific_notes", ""),
        audit_readiness=analysis.get("audit_readiness", "NOT READY"),
    )
    db.add(report)

    # Update document status
    doc.status = "analyzed"
    await db.commit()
    await db.refresh(report)

    return report.to_dict()
