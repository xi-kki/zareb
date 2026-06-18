from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import joinedload
from app.core.database import get_db
from app.models.report import ComplianceReport
from app.models.document import Document
from app.api.auth import get_current_user
from app.models.user import User

router = APIRouter(prefix="/api/reports", tags=["reports"])


@router.get("")
async def list_reports(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(ComplianceReport)
        .options(joinedload(ComplianceReport.document))
        .where(ComplianceReport.user_id == user.id)
        .order_by(ComplianceReport.created_at.desc())
    )
    reports = result.scalars().all()
    data = []
    for r in reports:
        d = r.to_dict()
        if r.document:
            d["document"] = r.document.to_dict()
        data.append(d)
    return data


@router.get("/{report_id}")
async def get_report(
    report_id: str,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(ComplianceReport)
        .options(joinedload(ComplianceReport.document))
        .where(
            ComplianceReport.id == report_id,
            ComplianceReport.user_id == user.id,
        )
    )
    report = result.scalar_one_or_none()
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found")
    d = report.to_dict()
    if report.document:
        d["document"] = report.document.to_dict()
    return d
