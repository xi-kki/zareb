from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.models.report import ComplianceReport
from app.services.ai_service import ai_service
from app.api.auth import get_current_user
from app.models.user import User

router = APIRouter(prefix="/api/chat", tags=["chat"])


class ChatRequest(BaseModel):
    message: str
    report_id: Optional[str] = None
    document_id: Optional[str] = None


@router.post("")
async def chat(
    request: ChatRequest,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    # Load report context if provided
    report_context = None
    if request.report_id:
        result = await db.execute(
            select(ComplianceReport).where(
                ComplianceReport.id == request.report_id,
                ComplianceReport.user_id == user.id,
            )
        )
        report = result.scalar_one_or_none()
        if report:
            # Build context from report
            gaps = report.gaps_found or []
            issues = report.critical_issues or []
            recommendations = report.recommendations or []
            context_parts = [
                f"Standard assessed: {report.standard}",
                f"Overall score: {report.overall_score}/100",
                f"Audit readiness: {report.audit_readiness}",
                f"Critical issues: {'; '.join(issues[:3])}",
                f"Key gaps: {'; '.join([g.get('issue', '') for g in gaps[:5]])}",
            ]
            report_context = "\n".join(context_parts)

    # Stream response
    async def generate():
        async for token in claude_service.chat_stream(request.message, report_context):
            yield f"data: {token}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(generate(), media_type="text/event-stream")
