# Use official lightweight Python image
FROM python:3.10-slim

# Set working directory
WORKDIR /app

# Install system dependencies (e.g., git is often needed for some pip packages)
RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements from the project root
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Expose the application port
EXPOSE 8000

# Run uvicorn with reload enabled for development
# host 0.0.0.0 is crucial for Docker networking
CMD ["uvicorn", "opustag.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
