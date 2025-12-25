# Stage 1: Build Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
# Adjust TS config if needed for build environment, or rely on existing files
# We assume 'npm run build' outputs to 'dist'
RUN npm run build

# Stage 2: Build Final Image
FROM python:3.10-slim

WORKDIR /app

# Install runtime system dependencies (if any needed, e.g. for mutagen/flac optional features)
# git is often useful if pip installs from git, but here we install from local.
RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    && rm -rf /var/lib/apt/lists/*

# Copy project definition files
COPY pyproject.toml requirements.txt README.md MANIFEST.in ./

# Copy backend code
COPY opustag/ opustag/

# Copy built frontend assets from Stage 1 into the python package's static directory
# ensuring the static directory exists first (though COPY creates it)
COPY --from=frontend-builder /frontend/dist opustag/static/

# Install the package itself (and dependencies)
# This handles requirements.txt via pyproject.toml or direct install
RUN pip install .

# Create a volume for music
VOLUME /music

# Expose port
EXPOSE 8000

# Set environment variable to ensure music dir is known (optional, but good practice)
ENV OPUSTAG_MUSIC_DIR=/music

# Run the installed entrypoint
CMD ["opustag", "--host", "0.0.0.0", "--port", "8000", "--no-browser", "--music-dir", "/music"]
