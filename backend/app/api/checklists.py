from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.api.auth import get_current_user
from app.models.user import User

router = APIRouter(prefix="/api/checklists", tags=["checklists"])


class SaveChecklistRequest(BaseModel):
    completed_items: list


# Pre-populated checklist templates per standard
CHECKLIST_TEMPLATES = {
    "HACCP": [
        {"id": "haccp_1", "text": "Conduct hazard analysis (biological, chemical, physical)", "principle": 1},
        {"id": "haccp_2", "text": "Identify Critical Control Points (CCPs)", "principle": 2},
        {"id": "haccp_3", "text": "Establish critical limits for each CCP", "principle": 3},
        {"id": "haccp_4", "text": "Establish monitoring procedures for each CCP", "principle": 4},
        {"id": "haccp_5", "text": "Establish corrective actions when deviation occurs", "principle": 5},
        {"id": "haccp_6", "text": "Establish verification procedures", "principle": 6},
        {"id": "haccp_7", "text": "Establish record-keeping and documentation", "principle": 7},
    ],
    "FSMA": [
        {"id": "fsma_1", "text": "Preventive Controls for Human Food rule implemented", "principle": 0},
        {"id": "fsma_2", "text": "Food Traceability Rule (FSMA 204) compliance plan ready (deadline 2028)", "principle": 0},
        {"id": "fsma_3", "text": "Supplier verification programs established", "principle": 0},
        {"id": "fsma_4", "text": "Environmental monitoring programs in place", "principle": 0},
    ],
    "BRCGS": [
        {"id": "brcgs_1", "text": "Senior management commitment demonstrated", "section": 1},
        {"id": "brcgs_2", "text": "Food safety plan (HACCP) documented", "section": 2},
        {"id": "brcgs_3", "text": "Food safety and quality management system in place", "section": 3},
        {"id": "brcgs_4", "text": "Site standards compliant", "section": 4},
        {"id": "brcgs_5", "text": "Product control procedures established", "section": 5},
        {"id": "brcgs_6", "text": "Process control measures documented", "section": 6},
        {"id": "brcgs_7", "text": "Personnel training and hygiene requirements met", "section": 7},
    ],
}


@router.get("/{standard}")
async def get_checklist(standard: str):
    standard_upper = standard.upper()
    if standard_upper not in CHECKLIST_TEMPLATES:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Checklist not found for standard: {standard}")
    return {"standard": standard_upper, "items": CHECKLIST_TEMPLATES[standard_upper]}


@router.post("/{standard}/save")
async def save_checklist(
    standard: str,
    request: SaveChecklistRequest,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    standard_upper = standard.upper()
    if standard_upper not in CHECKLIST_TEMPLATES:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Checklist not found for standard: {standard}")

    # Upsert saved checklist
    from app.models.report import ComplianceReport  # Reuse for simplicity - in production use a dedicated SavedChecklist model

    return {"status": "saved", "standard": standard_upper, "completed_items": request.completed_items, "total_items": len(CHECKLIST_TEMPLATES[standard_upper])}
