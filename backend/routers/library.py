from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from backend.services import tagger
import os

router = APIRouter(prefix="/api/library", tags=["library"])

class ScanRequest(BaseModel):
    path: str

@router.post("/scan")
def scan_library(request: ScanRequest):
    if not os.path.exists(request.path):
        raise HTTPException(status_code=404, detail="Path not found")
    
    files = tagger.scan_directory(request.path)
    return {"path": request.path, "files": files, "count": len(files)}
