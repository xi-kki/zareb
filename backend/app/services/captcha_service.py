"""CAPTCHA verification service — Google reCAPTCHA v3 (invisible)."""

import os
import logging
import httpx

logger = logging.getLogger(__name__)

RECAPTCHA_VERIFY_URL = "https://www.google.com/recaptcha/api/siteverify"


async def verify_captcha(token: str | None) -> bool:
    """Verify a Google reCAPTCHA v3 token.
    
    In development mode (DEBUG=true), returns True without verification.
    In production, returns False if the token is invalid or missing.
    """
    # Skip CAPTCHA in development mode
    if os.environ.get("DEBUG", "").lower() == "true":
        return True

    if not token:
        logger.warning("CAPTCHA verification skipped: no token provided")
        return False

    secret_key = os.environ.get("RECAPTCHA_SECRET_KEY", "")
    if not secret_key:
        logger.warning("CAPTCHA verification skipped: RECAPTCHA_SECRET_KEY not set")
        return True  # Don't block if not configured

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(
                RECAPTCHA_VERIFY_URL,
                data={
                    "secret": secret_key,
                    "response": token,
                },
            )
            result = response.json()
            
            if result.get("success"):
                # reCAPTCHA v3 returns a score (0.0 to 1.0)
                score = result.get("score", 0.0)
                if score >= 0.5:
                    return True
                else:
                    logger.warning(f"CAPTCHA score too low: {score}")
                    return False
            else:
                error_codes = result.get("error-codes", [])
                logger.warning(f"CAPTCHA verification failed: {error_codes}")
                return False
    except Exception as e:
        logger.warning(f"CAPTCHA verification error: {e}")
        return True  # Allow on network error (don't block users)
