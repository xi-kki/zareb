"""Admin endpoints — user management, system stats, and moderation."""

import os
import logging
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, text
from sqlalchemy.orm import joinedload

from app.core.database import get_db
from app.models.user import User
from app.models.document import Document
from app.models.report import ComplianceReport
from app.api.auth import get_current_user

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/admin", tags=["admin"])


# ── Admin access control ─────────────────────────────────

ADMIN_EMAILS = [
    email.strip().lower()
    for email in os.environ.get("ADMIN_EMAILS", "").split(",")
    if email.strip()
]

async def require_admin(user: User = Depends(get_current_user)) -> User:
    """Ensure the current user is an admin."""
    if ADMIN_EMAILS and user.email.lower() not in ADMIN_EMAILS:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )
    return user


# ── Dashboard statistics ─────────────────────────────────

@router.get("/stats")
async def admin_stats(
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_admin),
):
    """Get system-wide statistics."""
    # User count
    user_result = await db.execute(select(func.count(User.id)))
    total_users = user_result.scalar() or 0

    # Document count
    doc_result = await db.execute(select(func.count(Document.id)))
    total_docs = doc_result.scalar() or 0

    # Report count
    report_result = await db.execute(select(func.count(ComplianceReport.id)))
    total_reports = report_result.scalar() or 0

    # Avg score
    avg_result = await db.execute(select(func.avg(ComplianceReport.overall_score)))
    avg_score = round(float(avg_result.scalar() or 0), 1)

    # Users by country
    country_result = await db.execute(
        select(User.country, func.count(User.id))
        .group_by(User.country)
        .order_by(func.count(User.id).desc())
    )
    users_by_country = {row[0]: row[1] for row in country_result.fetchall()}

    # Users by export market
    market_result = await db.execute(
        select(User.export_market, func.count(User.id))
        .group_by(User.export_market)
    )
    users_by_market = {row[0]: row[1] for row in market_result.fetchall()}

    # Users registered in the last 7 days
    week_ago = datetime.now(timezone.utc).replace(
        hour=0, minute=0, second=0, microsecond=0
    )
    import time
    week_ago_ts = week_ago.timestamp()
    from sqlalchemy import cast, Date
    new_users_result = await db.execute(
        select(func.count(User.id))
        .where(cast(User.created_at, Date) >= cast(week_ago, Date))
    )
    new_users_7d = new_users_result.scalar() or 0

    return {
        "total_users": total_users,
        "total_documents": total_docs,
        "total_reports": total_reports,
        "average_score": avg_score,
        "users_by_country": users_by_country,
        "users_by_market": users_by_market,
        "new_users_7d": new_users_7d,
        "admin_emails": ADMIN_EMAILS,
    }


# ── List all users (admin only) ──────────────────────────

@router.get("/users")
async def list_users(
    page: int = Query(1, ge=1),
    per_page: int = Query(50, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_admin),
):
    """List all users with pagination."""
    offset = (page - 1) * per_page
    result = await db.execute(
        select(User)
        .order_by(User.created_at.desc())
        .offset(offset)
        .limit(per_page)
    )
    users = result.scalars().all()

    total_result = await db.execute(select(func.count(User.id)))
    total = total_result.scalar() or 0

    return {
        "users": [u.to_dict() for u in users],
        "page": page,
        "per_page": per_page,
        "total": total,
        "pages": (total + per_page - 1) // per_page,
    }


# ── Delete a user (admin only) ───────────────────────────

@router.delete("/users/{user_id}")
async def delete_user(
    user_id: str,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_admin),
):
    """Delete a user account (admin only)."""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    await db.delete(user)
    await db.commit()
    return {"status": "deleted", "user_id": user_id}


# ── System health (admin only) ───────────────────────────

@router.get("/health")
async def admin_health(
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_admin),
):
    """Detailed system health check (admin only)."""
    try:
        # Test DB connection
        await db.execute(text("SELECT 1"))
        db_ok = True
    except Exception:
        db_ok = False

    return {
        "status": "healthy" if db_ok else "degraded",
        "database": "connected" if db_ok else "error",
        "admin_emails": ADMIN_EMAILS,
        "version": os.environ.get("ZAREB_VERSION", "0.1.0"),
    }
