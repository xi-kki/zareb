"""Cloudinary file storage service.

Cloudinary is optional — only import the package when actually configured.
This prevents ImportError when the cloudinary package isn't installed.
"""

from app.core.config import settings


def _get_cloudinary():
    """Lazy-import cloudinary to avoid ImportError when not installed."""
    try:
        import cloudinary
        import cloudinary.uploader

        cloudinary.config(
            cloud_name=settings.CLOUDINARY_CLOUD_NAME,
            api_key=settings.CLOUDINARY_API_KEY,
            api_secret=settings.CLOUDINARY_API_SECRET,
            secure=True,
        )
        return cloudinary
    except ImportError:
        return None


async def upload_file(file_bytes: bytes, filename: str, folder: str = "zareb-documents") -> str:
    """Upload a file to Cloudinary and return the secure URL."""
    import asyncio

    cloudinary = _get_cloudinary()
    if not cloudinary:
        raise RuntimeError("Cloudinary is not installed. Run: pip install cloudinary")

    loop = asyncio.get_event_loop()

    def _upload():
        result = cloudinary.uploader.upload(
            file_bytes,
            resource_type="raw",
            folder=folder,
            public_id=filename.rsplit(".", 1)[0],
            use_filename=True,
            unique_filename=True,
        )
        return result["secure_url"]

    url = await loop.run_in_executor(None, _upload)
    return url


async def delete_file(public_id: str) -> bool:
    """Delete a file from Cloudinary."""
    import asyncio

    cloudinary = _get_cloudinary()
    if not cloudinary:
        return False

    loop = asyncio.get_event_loop()

    def _delete():
        result = cloudinary.uploader.destroy(public_id, resource_type="raw")
        return result.get("result") == "ok"

    return await loop.run_in_executor(None, _delete)
