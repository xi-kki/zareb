"""Document upload, listing, and deletion endpoints."""

import os
import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.core.config import settings
from app.models.document import Document
from app.services.document_parser import extract_text
# Cloudinary is optional — skip if not configured
from app.core.config import settings
if settings.CLOUDINARY_CLOUD_NAME:
    from app.services.cloudinary_service import upload_file as cloudinary_upload
else:
    async def cloudinary_upload(file_bytes: bytes, filename: str) -> str:
        return ""
from app.api.auth import get_current_user
from app.models.user import User

router = APIRouter(prefix="/api/documents", tags=["documents"])

# Allowed MIME types and their magic bytes
ALLOWED_FILE_SIGNATURES = {
    b"%PDF": "application/pdf",
    b"\x50\x4B\x03\x04": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",  # DOCX
    b"\xFF\xD8\xFF": "image/jpeg",  # JPEG
    b"\x89PNG\r\n\x1a\n": "image/png",  # PNG
    b"RIFF": "image/webp",  # WEBP (starts with RIFF....WEBP)
}

VALID_DOC_TYPES = {"haccp_plan", "ingredient_list", "product_label", "sop", "audit_report", "supplier_cert", "other"}

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB


def _validate_file_signature(file_bytes: bytes) -> str | None:
    """Validate file by checking magic bytes. Returns the MIME type or None."""
    for signature, mime_type in ALLOWED_FILE_SIGNATURES.items():
        if file_bytes[:len(signature)] == signature:
            return mime_type
    return None


async def _store_file_locally(file_bytes: bytes, filename: str) -> str:
    """Store file locally when Cloudinary is not configured. Returns file path."""
    upload_dir = settings.UPLOAD_DIR
    upload_dir.mkdir(parents=True, exist_ok=True)
    # Generate unique filename to prevent overwrites
    ext = Path(filename).suffix if "." in filename else ".pdf"
    unique_name = f"{uuid.uuid4().hex}{ext}"
    file_path = upload_dir / unique_name
    with open(file_path, "wb") as f:
        f.write(file_bytes)
    return str(file_path)


@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    doc_type: str = Form(...),
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Upload a compliance document (PDF or DOCX, max 10MB)."""
    # Validate doc_type
    if doc_type not in VALID_DOC_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid doc_type. Must be one of: {', '.join(sorted(VALID_DOC_TYPES))}",
        )

    # Read file
    file_bytes = await file.read()
    if len(file_bytes) > MAX_FILE_SIZE:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="File too large. Maximum 10MB.")

    # Validate file signature (magic bytes), not just content-type header
    detected_type = _validate_file_signature(file_bytes)
    if not detected_type:
        # Check for WebP (RIFF + WEBP)
        if file_bytes[:4] == b"RIFF" and file_bytes[8:12] == b"WEBP":
            detected_type = "image/webp"
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid file type. Only PDF, DOCX, and images (JPG, PNG, WebP) are supported.",
            )

    # Extract text content
    try:
        parsed_text = await extract_text(file_bytes, file.filename or "document.pdf")
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

    # Upload to Cloudinary or local fallback
    cloud_url = None
    if settings.CLOUDINARY_CLOUD_NAME and settings.CLOUDINARY_API_KEY:
        try:
            cloud_url = await cloudinary_upload(file_bytes, file.filename or "document.pdf")
        except Exception as e:
            # Log but don't fail — fall back to local storage
            print(f"[Zareb] Cloudinary upload failed, using local storage: {e}")
    
    if not cloud_url:
        cloud_url = await _store_file_locally(file_bytes, file.filename or "document.pdf")

    # Save to database
    doc = Document(
        user_id=user.id,
        filename=file.filename or "document.pdf",
        doc_type=doc_type,
        cloudinary_url=cloud_url,
        parsed_text=parsed_text,
        status="pending",
    )
    db.add(doc)
    await db.commit()
    await db.refresh(doc)

    return doc.to_dict()


@router.get("")
async def list_documents(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """List all documents for the current user, newest first."""
    result = await db.execute(
        select(Document)
        .where(Document.user_id == user.id)
        .order_by(Document.upload_date.desc())
    )
    docs = result.scalars().all()
    return [doc.to_dict() for doc in docs]


@router.delete("/{document_id}")
async def delete_document(
    document_id: str,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Delete a document (only if it belongs to the current user)."""
    result = await db.execute(
        select(Document).where(
            Document.id == document_id,
            Document.user_id == user.id,
        )
    )
    doc = result.scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")

    # If stored locally, delete the file
    if doc.cloudinary_url and not doc.cloudinary_url.startswith("http"):
        try:
            local_path = Path(doc.cloudinary_url)
            if local_path.exists():
                local_path.unlink()
        except OSError:
            pass  # Non-critical — file deletion is best-effort

    await db.delete(doc)
    await db.commit()
    return {"status": "deleted", "id": document_id}
