FROM python:3.11-slim

WORKDIR /app

# Install system dependencies for scikit-learn, Pillow, etc.
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    build-essential \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# Copy backend code
COPY backend/ .

# Install Python dependencies
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir \
        fastapi==0.115.0 \
        "uvicorn[standard]==0.30.0" \
        "sqlalchemy[asyncio]==2.0.35" \
        asyncpg==0.29.0 \
        python-jose[cryptography]==3.3.0 \
        "passlib[bcrypt]==1.7.4" \
        bcrypt==4.0.1 \
        python-multipart==0.0.12 \
        pydantic==2.9.0 \
        PyPDF2==3.0.1 \
        python-docx==1.1.2 \
        httpx==0.27.2 \
        python-dotenv==1.0.1 \
        aiofiles==24.1.0 \
        aiosqlite==0.20.0 \
        fpdf2==2.8.1 \
        scikit-learn==1.5.1 \
        Pillow==10.4.0 \
        numpy==1.26.4 \
        email-validator==2.2.0 \
        slowapi==0.1.9

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=15s --timeout=5s --start-period=30s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')" || exit 1

# Start with railway_start.py for proper diagnostics
CMD ["python", "railway_start.py"]
