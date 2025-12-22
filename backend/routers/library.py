from fastapi import APIRouter, HTTPException, Response
from pydantic import BaseModel
from typing import List
from backend.services.tagger import tagger_service
import os

router = APIRouter(prefix="/api/library", tags=["library"])

class EmbedRequest(BaseModel):
    file_paths: List[str]
    image_url: str

class ScanRequest(BaseModel):
    path: str = "/music"

@router.post("/scan")
def scan_library(req: ScanRequest):
    if not os.path.exists(req.path):
        raise HTTPException(status_code=404, detail=f"Path not found: {req.path}")
    
    albums = tagger_service.scan_library(req.path)
    return albums

@router.get("/cover")
def get_cover(path: str):
    """
    Returns the cover art binary from a specific audio file.
    Used for displaying local album art.
    """
    if not os.path.exists(path):
        return Response(status_code=404)
        
    data = tagger_service.get_cover_data(path)
    if not data:
        return Response(status_code=404)
        
    return Response(content=data, media_type="image/jpeg")

@router.post("/embed")
def embed_cover(req: EmbedRequest):
    """
    Downloads image from URL and embeds it into the specified files.
    """
    try:
        tagger_service.embed_cover_from_url(req.file_paths, req.image_url)
        return {"status": "success", "processed": len(req.file_paths)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))