"""
Groq Vision OCR Service — Extract text from food label images using Groq's vision model.

Uses llama-3.2-11b-vision-preview to read text from product labels, ingredient lists,
and packaging photos. No Tesseract or system deps needed.
"""

import base64
import io
import os
from typing import Optional
from PIL import Image

import httpx
from app.core.config import settings


async def extract_text_from_image(
    image_bytes: bytes,
    filename: str = "image.jpg",
    max_size: int = 2048,
) -> str:
    """
    Extract text from a food label image using Groq Vision API.
    
    - Resizes large images to max_size on longest side
    - Sends as base64 to llama-3.2-11b-vision-preview
    - Returns extracted text content
    """
    api_key = os.getenv("GROQ_API_KEY") or settings.GROQ_API_KEY
    if not api_key:
        # Fallback: no vision API available
        return "[OCR unavailable: No GROQ_API_KEY configured]"

    # Open and resize image if needed
    img = Image.open(io.BytesIO(image_bytes))
    w, h = img.size
    if max(w, h) > max_size:
        scale = max_size / max(w, h)
        img = img.resize((int(w * scale), int(h * scale)), Image.LANCZOS)
    
    # Convert to JPEG base64
    buf = io.BytesIO()
    img.convert("RGB").save(buf, format="JPEG", quality=85)
    b64_image = base64.b64encode(buf.getvalue()).decode("utf-8")
    data_uri = f"data:image/jpeg;base64,{b64_image}"

    # Call Groq Vision
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
            json={
                "model": "llama-3.2-11b-vision-preview",
                "messages": [
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "text",
                                "text": (
                                    "Extract ALL text from this food product label or compliance document image. "
                                    "Return every word, number, and symbol you can see. "
                                    "Include: product name, ingredients list, nutritional info, dates, weights, "
                                    "allergen warnings, manufacturer details, certifications, and batch numbers. "
                                    "Format the output as clean plain text preserving the original layout order."
                                ),
                            },
                            {
                                "type": "image_url",
                                "image_url": {"url": data_uri},
                            },
                        ],
                    }
                ],
                "max_tokens": 2000,
                "temperature": 0.1,
            },
        )
    
    response.raise_for_status()
    data = response.json()
    extracted = data["choices"][0]["message"]["content"] or ""
    
    return extracted.strip()


SUPPORTED_IMAGE_FORMATS = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
}

def is_image_file(filename: str) -> bool:
    """Check if filename has a supported image extension."""
    ext = os.path.splitext(filename.lower())[1]
    return ext in SUPPORTED_IMAGE_FORMATS
