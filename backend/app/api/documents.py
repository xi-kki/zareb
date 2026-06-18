from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.models.document import Document
from app.services.document_parser import extract_text
from app.services.cloudinary_service import upload_file
from app.api.auth import get_current_user
from app.models.user import User

router = APIRouter(prefix="/api/documents", tags=["documents"])


@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    doc_type: str = Form(...),
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    # Validate file type
    allowed_types = {"application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/msword"}
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Only PDF and DOCX files are supported")

    # Validate doc_type
    valid_doc_types = {"haccp_plan", "ingredient_list", "product_label", "sop", "audit_report", "supplier_cert", "other"}
    if doc_type not in valid_doc_types:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Invalid doc_type. Must be one of: {', '.join(valid_doc_types)}")

    # Read file
    file_bytes = await file.read()
    if len(file_bytes) > 10 * 1024 * 1024:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="File too large. Maximum 10MB.")

    # Extract text
    try:
        parsed_text = await extract_text(file_bytes, file.filename)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

    # Upload to Cloudinary
    try:
        cloudinary_url = await upload_file(file_bytes, file.filename)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Cloudinary upload failed: {str(e)}")

    # Save to database
    doc = Document(
        user_id=user.id,
        filename=file.filename,
        doc_type=doc_type,
        cloudinary_url=cloudinary_url,
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
    result = await db.execute(
        select(Document).where(Document.user_id == user.id).order_by(Document.upload_date.desc())
    )
    docs = result.scalars().all()
    return [doc.to_dict() for doc in docs]


@router.delete("/{document_id}")
async def delete_document(
    document_id: str,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Document).where(Document.id == document_id, Document.user_id == user.id)
    )
    doc = result.scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")

    await db.delete(doc)
    await db.commit()
    return {"status": "deleted", "id": document_id}
