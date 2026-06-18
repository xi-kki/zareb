import cloudinary
import cloudinary.uploader
from app.core.config import settings

cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET,
    secure=True,
)


async def upload_file(file_bytes: bytes, filename: str, folder: str = "nuri-documents") -> str:
    """Upload a file to Cloudinary and return the secure URL."""
    import asyncio
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
    loop = asyncio.get_event_loop()

    def _delete():
        result = cloudinary.uploader.destroy(public_id, resource_type="raw")
        return result.get("result") == "ok"

    return await loop.run_in_executor(None, _delete)
