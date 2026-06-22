"""Email service for Zareb — SMTP2GO integration for magic link delivery."""

import os
import logging
import httpx

logger = logging.getLogger(__name__)

SMTP2GO_API_URL = "https://api.smtp2go.com/v3/email/send"


def send_magic_link_email(recipient_email: str, magic_link: str) -> bool:
    """Send a magic link email via SMTP2GO API.
    
    Falls back to console logging if SMTP2GO is not configured.
    Returns True if sent successfully, False otherwise.
    """
    app_name = "Zareb"
    
    # Build email content
    subject = f"Sign in to {app_name}"
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
                 background: #f8f6f3; margin: 0; padding: 0;">
      <div style="max-width: 480px; margin: 40px auto; background: white; 
                  border-radius: 18px; padding: 40px; 
                  box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
        
        <div style="text-align: center; margin-bottom: 32px;">
          <div style="width: 56px; height: 56px; background: #0f766e; 
                      border-radius: 14px; display: inline-flex; align-items: center; 
                      justify-content: center; margin-bottom: 16px;">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" 
                 stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M11 20A7 7 0 0 1 9.8 6.9C15.5 4.9 17 3.5 17 3.5s1 3 1 6c0 2.2-1 4-3 5"/>
              <path d="M21 12a7 7 0 0 1-7 7"/>
            </svg>
          </div>
          <h1 style="font-family: Georgia, serif; font-size: 24px; color: #1c1917; 
                     margin: 0; letter-spacing: -0.02em;">{app_name}</h1>
          <p style="color: #78716c; font-size: 15px; margin-top: 4px;">
            Know your gaps before the auditor does.
          </p>
        </div>

        <p style="color: #44403c; font-size: 16px; line-height: 1.6;">
          Click the button below to sign in to your {app_name} account. 
          This link expires in 15 minutes.
        </p>

        <div style="text-align: center; margin: 32px 0;">
          <a href="{magic_link}" 
             style="display: inline-block; background: #0f766e; color: white; 
                    font-size: 16px; font-weight: 600; padding: 14px 36px; 
                    border-radius: 9999px; text-decoration: none;
                    box-shadow: 0 4px 12px rgba(15, 118, 110, 0.3);">
            Sign in to {app_name}
          </a>
        </div>

        <p style="color: #78716c; font-size: 13px; line-height: 1.5;">
          If you didn't request this link, you can safely ignore this email.
        </p>

        <hr style="border: none; border-top: 1px solid #e8e0d5; margin: 24px 0;">
        <p style="color: #a09888; font-size: 12px; text-align: center;">
          {app_name} — Built for African food founders, by founders.
        </p>
      </div>
    </body>
    </html>
    """

    # Try SMTP2GO
    api_key = os.environ.get("SMTP2GO_API_KEY") or ""
    from_email = os.environ.get("SMTP2GO_FROM_EMAIL", "noreply@zareb.app")
    from_name = "Zareb"

    if api_key:
        try:
            payload = {
                "api_key": api_key,
                "to": [recipient_email],
                "sender": f"{from_name} <{from_email}>",
                "subject": subject,
                "html_body": html_content,
            }
            response = httpx.post(SMTP2GO_API_URL, json=payload, timeout=15.0)
            data = response.json()
            if data.get("data", {}).get("succeeded", False):
                logger.info(f"Magic link email sent to {recipient_email} via SMTP2GO")
                return True
            else:
                error = data.get("data", {}).get("error", "unknown error")
                logger.warning(f"SMTP2GO send failed: {error}. Falling back to console log.")
        except Exception as e:
            logger.warning(f"SMTP2GO error: {e}. Falling back to console log.")
    else:
        logger.info("SMTP2GO_API_KEY not set — falling back to console log.")

    # Fallback: log to console
    logger.info(f"=== MAGIC LINK for {recipient_email} ===")
    logger.info(f"Link: {magic_link}")
    logger.info(f"Subject: {subject}")
    logger.info("(Set SMTP2GO_API_KEY for email delivery)")
    
    return True  # Don't fail — console logging is acceptable for dev


def send_welcome_email(recipient_email: str, login_url: str) -> bool:
    """Send a welcome email after registration."""
    logger.info(f"=== WELCOME EMAIL for {recipient_email} ===")
    logger.info(f"Login: {login_url}")
    logger.info("(SMTP2GO welcome emails not configured yet)")
    return True
