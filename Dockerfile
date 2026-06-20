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

# Install Python dependencies from requirements.txt
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=15s --timeout=5s --start-period=30s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')" || exit 1

# Start with railway_start.py for proper diagnostics
CMD ["python", "railway_start.py"]
