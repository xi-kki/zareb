"""Application configuration."""

import os
from pathlib import Path

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent.parent
load_dotenv(BASE_DIR / ".env")


class Settings:
    APP_NAME: str = "Zareb API"
    APP_VERSION: str = "0.1.0"
    DEBUG: bool = os.getenv("DEBUG", "true").lower() == "true"

    # Database
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        f"sqlite:///{BASE_DIR / 'zareb.db'}",
    )

    # JWT
    JWT_SECRET: str = os.getenv("JWT_SECRET", "zareb-dev-secret-change-in-production-32chars")
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    JWT_EXPIRY_HOURS: int = int(os.getenv("JWT_EXPIRY_HOURS", "24"))

    # AI Provider
    AI_PROVIDER: str = os.getenv("AI_PROVIDER", "groq")  # "groq" or "claude"
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    GROQ_MODEL: str = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")

    # Claude (fallback)
    ANTHROPIC_API_KEY: str = os.getenv("ANTHROPIC_API_KEY", "")
    CLAUDE_MODEL: str = os.getenv("CLAUDE_MODEL", "claude-sonnet-4-6")
    AI_MAX_TOKENS: int = int(os.getenv("AI_MAX_TOKENS", "2000"))

    # Cloudinary
    CLOUDINARY_CLOUD_NAME: str = os.getenv("CLOUDINARY_CLOUD_NAME", "")
    CLOUDINARY_API_KEY: str = os.getenv("CLOUDINARY_API_KEY", "")
    CLOUDINARY_API_SECRET: str = os.getenv("CLOUDINARY_API_SECRET", "")

    # Email (SMTP2GO — 1,000 free emails/month)
    SMTP2GO_API_KEY: str = os.getenv("SMTP2GO_API_KEY", "")
    SMTP2GO_FROM_EMAIL: str = os.getenv("SMTP2GO_FROM_EMAIL", "noreply@zareb.app")

    # CAPTCHA (Google reCAPTCHA v3)
    RECAPTCHA_SECRET_KEY: str = os.getenv("RECAPTCHA_SECRET_KEY", "")

    # Site / Admin
    SITE_URL: str = os.getenv("SITE_URL", "https://zareb.netlify.app")
    ADMIN_EMAILS: list[str] = [e.strip() for e in os.getenv("ADMIN_EMAILS", "").split(",") if e.strip()]

    # CORS
    _raw_cors: str = os.getenv(
        "CORS_ORIGINS",
        "http://localhost:5173,http://localhost:3000,https://zareb.netlify.app",
    )

    @property
    def cors_origins_list(self) -> list[str]:
        """Parse CORS_ORIGINS into a list, filtering empty strings."""
        origins = [o.strip() for o in self._raw_cors.split(",") if o.strip()]
        if not origins:
            origins = ["http://localhost:5173", "http://localhost:3000", "https://zareb.netlify.app"]
        return origins

    # File upload
    MAX_UPLOAD_SIZE_MB: int = 10
    UPLOAD_DIR: Path = BASE_DIR / "uploads"


settings = Settings()
