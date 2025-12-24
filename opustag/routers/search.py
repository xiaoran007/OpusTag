from fastapi import APIRouter, Query
from typing import List, Optional
from opustag.services import itunes

router = APIRouter(prefix="/api/search", tags=["search"])

@router.get("/")
def search_itunes(q: str, country: str = "US", limit: int = 10):
    results = itunes.search_albums(q, country, limit)
    
    # Enrich results with high-res preview URL
    for album in results:
        artwork = album.get("artworkUrl100")
        if artwork:
            album["artworkUrlHighRes"] = itunes.get_high_res_url(artwork, "10000x10000")
            album["artworkUrlPreview"] = itunes.get_high_res_url(artwork, "600x600")
            
    return results
