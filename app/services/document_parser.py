import PyPDF2
import docx
import io
from app.services.vision_service import extract_text_from_image, is_image_file


async def extract_text_from_pdf(file_bytes: bytes) -> str:
    """Extract text from a PDF file."""
    text = []
    try:
        reader = PyPDF2.PdfReader(io.BytesIO(file_bytes))
        for page in reader.pages:
            page_text = page.extract_text()
            if page_text:
                text.append(page_text)
    except Exception as e:
        raise ValueError(f"Failed to parse PDF: {str(e)}")
    return "\n".join(text)


async def extract_text_from_docx(file_bytes: bytes) -> str:
    """Extract text from a DOCX file."""
    text = []
    try:
        doc = docx.Document(io.BytesIO(file_bytes))
        for para in doc.paragraphs:
            if para.text.strip():
                text.append(para.text)
    except Exception as e:
        raise ValueError(f"Failed to parse DOCX: {str(e)}")
    return "\n".join(text)


async def extract_text_from_image_file(file_bytes: bytes, filename: str) -> str:
    """Extract text from an image file using Groq Vision OCR."""
    try:
        text = await extract_text_from_image(file_bytes, filename)
        return text
    except Exception as e:
        raise ValueError(f"Failed to extract text from image: {str(e)}")


async def extract_text(file_bytes: bytes, filename: str) -> str:
    """Extract text from a document based on file extension."""
    ext = filename.lower().rsplit(".", 1)[-1] if "." in filename else ""
    if ext == "pdf":
        return await extract_text_from_pdf(file_bytes)
    elif ext in ("docx", "doc"):
        return await extract_text_from_docx(file_bytes)
    elif ext in ("jpg", "jpeg", "png", "webp"):
        return await extract_text_from_image_file(file_bytes, filename)
    else:
        raise ValueError(f"Unsupported file type: .{ext}. Only PDF, DOCX, and images (JPG, PNG) are supported.")
