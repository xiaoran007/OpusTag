from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from opustag.routers import search, library
import os

app = FastAPI(title="OpusTag API", description="Backend for OpusTag Classical Music Manager")

# CORS config to allow frontend requests
origins = [
    "http://localhost:3000",
    "http://localhost:5173", # Vite default
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(search.router)
app.include_router(library.router)

# Serve static files
static_dir = os.path.join(os.path.dirname(__file__), "static")
if os.path.exists(static_dir):
    app.mount("/assets", StaticFiles(directory=os.path.join(static_dir, "assets")), name="assets")

    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        # If API request, let it fall through (though router logic usually handles this, 
        # but here we catch *everything* else). 
        # However, FastAPI routers are checked first if included before.
        # But `app.get("/{full_path:path}")` is a catch-all.
        
        # Check if file exists in static
        file_path = os.path.join(static_dir, full_path)
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        
        # Fallback to index.html for SPA
        return FileResponse(os.path.join(static_dir, "index.html"))
else:
    @app.get("/")
    def read_root():
        return {"status": "ok", "message": "OpusTag Backend is running (Frontend not found)"}
