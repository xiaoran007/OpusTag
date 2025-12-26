from fastapi import APIRouter, HTTPException, Response
from pydantic import BaseModel
from typing import List, Optional
from opustag.services.tagger import tagger_service
import os

router = APIRouter(prefix="/api/library", tags=["library"])

class EmbedRequest(BaseModel):
    file_paths: List[str]
    image_url: str

class UpdateMetaRequest(BaseModel):
    file_paths: List[str]
    artist: str
    album: str
    year: str
    genre: Optional[str] = None
    composer: Optional[str] = None

class ScanRequest(BaseModel):
    path: Optional[str] = None

@router.post("/scan")
def scan_library(req: ScanRequest):
    scan_path = req.path or os.getenv("OPUSTAG_MUSIC_DIR", "/music")
    
    if not os.path.exists(scan_path):
        raise HTTPException(status_code=404, detail=f"Path not found: {scan_path}")
    
    albums = tagger_service.scan_library(scan_path)
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

@router.post("/update_meta")
def update_metadata(req: UpdateMetaRequest):
    """
    Updates metadata (Artist, Album, Year, Genre, Composer) for a list of files.
    """
    tags = {
        "artist": req.artist,
        "album": req.album,
        "year": req.year
    }
    if req.genre is not None:
        tags["genre"] = req.genre
    if req.composer is not None:
        tags["composer"] = req.composer
        
    try:
        tagger_service.update_album_metadata(req.file_paths, tags)
        return {"status": "success", "processed": len(req.file_paths)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
