from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.api.auth import get_current_user
from app.models.user import User
from app.models.checklist import SavedChecklist

router = APIRouter(prefix="/api/checklists", tags=["checklists"])


class SaveChecklistRequest(BaseModel):
    completed_items: list


# Pre-populated checklist templates per standard
CHECKLIST_TEMPLATES = {
    # ── HACCP (7 Principles) ──────────────────────────────
    "HACCP": [
        {"id": "haccp_1", "text": "Conduct hazard analysis (biological, chemical, physical)", "principle": 1},
        {"id": "haccp_2", "text": "Identify Critical Control Points (CCPs)", "principle": 2},
        {"id": "haccp_3", "text": "Establish critical limits for each CCP", "principle": 3},
        {"id": "haccp_4", "text": "Establish monitoring procedures for each CCP", "principle": 4},
        {"id": "haccp_5", "text": "Establish corrective actions when deviation occurs", "principle": 5},
        {"id": "haccp_6", "text": "Establish verification procedures", "principle": 6},
        {"id": "haccp_7", "text": "Establish record-keeping and documentation", "principle": 7},
    ],
    # ── FSMA (FDA Food Safety Modernization Act) ──────────
    "FSMA": [
        {"id": "fsma_1", "text": "Preventive Controls for Human Food rule implemented", "principle": 0},
        {"id": "fsma_2", "text": "Food Traceability Rule (FSMA 204) compliance plan ready (deadline 2028)", "principle": 0},
        {"id": "fsma_3", "text": "Supplier verification programs established", "principle": 0},
        {"id": "fsma_4", "text": "Environmental monitoring programs in place", "principle": 0},
        {"id": "fsma_5", "text": "Food defense plan documented", "principle": 0},
        {"id": "fsma_6", "text": "Current Good Manufacturing Practice (CGMP) compliance", "principle": 0},
    ],
    # ── BRCGS Issue 9 ─────────────────────────────────────
    "BRCGS": [
        {"id": "brcgs_1", "text": "Senior management commitment demonstrated", "section": 1},
        {"id": "brcgs_2", "text": "Food safety plan (HACCP) documented", "section": 2},
        {"id": "brcgs_3", "text": "Food safety and quality management system in place", "section": 3},
        {"id": "brcgs_4", "text": "Site standards compliant (building, equipment, pest control)", "section": 4},
        {"id": "brcgs_5", "text": "Product control procedures established", "section": 5},
        {"id": "brcgs_6", "text": "Process control measures documented", "section": 6},
        {"id": "brcgs_7", "text": "Personnel training and hygiene requirements met", "section": 7},
        {"id": "brcgs_8", "text": "High-risk / high-care area controls in place", "section": 8},
        {"id": "brcgs_9", "text": "Internal audits and inspection program active", "section": 9},
    ],
    # ── SQF (Safe Quality Food) ───────────────────────────
    "SQF": [
        {"id": "sqf_1", "text": "Food safety policy and commitment documented", "element": 1},
        {"id": "sqf_2", "text": "Food safety plan based on HACCP principles", "element": 2},
        {"id": "sqf_3", "text": "Food safety and quality management system in place", "element": 3},
        {"id": "sqf_4", "text": "Site conformity and food defense plan", "element": 4},
        {"id": "sqf_5", "text": "Supplier approval program documented", "element": 5},
        {"id": "sqf_6", "text": "Product identification, traceability, and recall plan", "element": 6},
        {"id": "sqf_7", "text": "Food safety and quality culture program", "element": 7},
    ],
    # ── ISO 22000 ──────────────────────────────────────────
    "ISO22000": [
        {"id": "iso_1", "text": "Food safety policy and objectives established", "clause": 5},
        {"id": "iso_2", "text": "Food safety management system scope defined", "clause": 4},
        {"id": "iso_3", "text": "HACCP plan documented with CCPs and critical limits", "clause": 8},
        {"id": "iso_4", "text": "Prerequisite programmes (PRPs) in place", "clause": 7},
        {"id": "iso_5", "text": "Traceability system and recall procedure documented", "clause": 8},
        {"id": "iso_6", "text": "Emergency preparedness and response plan", "clause": 8},
        {"id": "iso_7", "text": "Internal audit program and management review", "clause": 9},
    ],
    # ── NAFDAC (Nigeria) ──────────────────────────────────
    "NAFDAC": [
        {"id": "nafdac_1", "text": "NAFDAC registration number displayed on product label", "reg": 1},
        {"id": "nafdac_2", "text": "Product shelf-life and storage conditions declared", "reg": 2},
        {"id": "nafdac_3", "text": "Ingredients list in descending order of proportion", "reg": 3},
        {"id": "nafdac_4", "text": "Nutritional information per serving declared", "reg": 4},
        {"id": "nafdac_5", "text": "Manufacturing date and expiry/best-before date", "reg": 5},
        {"id": "nafdac_6", "text": "Batch/lot number for traceability", "reg": 6},
        {"id": "nafdac_7", "text": "Manufacturer name and address on label", "reg": 7},
        {"id": "nafdac_8", "text": "Net weight/volume declared", "reg": 8},
    ],
    # ── KEBS (Kenya) ───────────────────────────────────────
    "KEBS": [
        {"id": "kebs_1", "text": "KEBS standardization mark (SM) displayed", "reg": 1},
        {"id": "kebs_2", "text": "Product complies with applicable KS standard", "reg": 2},
        {"id": "kebs_3", "text": "Ingredients list in descending order", "reg": 3},
        {"id": "kebs_4", "text": "Net quantity declared in metric units", "reg": 4},
        {"id": "kebs_5", "text": "Manufacturing and expiry dates declared", "reg": 5},
        {"id": "kebs_6", "text": "Country of origin declared", "reg": 6},
        {"id": "kebs_7", "text": "Batch/lot identification for traceability", "reg": 7},
    ],
    # ── EU Food Law (FDA_EU) ───────────────────────────────
    "FDA_EU": [
        {"id": "eu_1", "text": "EU 14 major allergens declared on label", "reg": 1},
        {"id": "eu_2", "text": "Nutritional declaration per 100g/ml (Reg. 1169/2011)", "reg": 2},
        {"id": "eu_3", "text": "Ingredients list with quantitative ingredient declaration (QUID)", "reg": 3},
        {"id": "eu_4", "text": "Best-before or use-by date declared", "reg": 4},
        {"id": "eu_5", "text": "Country of origin or place of provenance", "reg": 5},
        {"id": "eu_6", "text": "Responsible person/address in the EU established", "reg": 6},
        {"id": "eu_7", "text": "Net quantity declaration", "reg": 7},
        {"id": "eu_8", "text": "Lot/batch identification for traceability", "reg": 8},
        {"id": "eu_9", "text": "Novel food authorization obtained if applicable", "reg": 9},
        {"id": "eu_10", "text": "EU organic certification (if claiming organic)", "reg": 10},
    ],
}


@router.get("/{standard}")
async def get_checklist(standard: str):
    standard_upper = standard.upper()
    if standard_upper not in CHECKLIST_TEMPLATES:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Checklist not found for standard: {standard}")
    return {"standard": standard_upper, "items": CHECKLIST_TEMPLATES[standard_upper]}


@router.get("/{standard}/progress")
async def get_saved_checklist(
    standard: str,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    standard_upper = standard.upper()
    if standard_upper not in CHECKLIST_TEMPLATES:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Checklist not found for standard: {standard}")
    result = await db.execute(
        select(SavedChecklist).where(
            SavedChecklist.user_id == user.id,
            SavedChecklist.standard == standard_upper,
        )
    )
    saved = result.scalar_one_or_none()
    if saved:
        return saved.to_dict()
    return {"standard": standard_upper, "completed_items": []}


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
    result = await db.execute(
        select(SavedChecklist).where(
            SavedChecklist.user_id == user.id,
            SavedChecklist.standard == standard_upper,
        )
    )
    existing = result.scalar_one_or_none()

    if existing:
        existing.completed_items = request.completed_items
        existing.updated_at = datetime.now(timezone.utc)
    else:
        existing = SavedChecklist(
            user_id=user.id,
            standard=standard_upper,
            completed_items=request.completed_items,
        )
        db.add(existing)

    await db.commit()
    await db.refresh(existing)

    return existing.to_dict()
