# Gemini CLI Agent Instructions

This file contains specific instructions for the Gemini CLI agent when working on the OpusTag project.

## Core Mandates

1.  **Version Control**:
    - After any significant file creation, modification, or deletion, the agent MUST perform a git commit.
    - Commit messages should be concise and follow the Conventional Commits specification (e.g., `feat: add fastapi backend structure`, `fix: resolve path issue in search service`).

2.  **Code Style**:
    - Python code should follow PEP 8 standards.
    - Frontend code (if any) should generally follow the project's existing style.

3.  **Project Structure**:
    - Backend logic resides in `backend/`.
    - Frontend logic resides in `frontend/`.
    - Keep logic modular (Service layer vs Router layer).
