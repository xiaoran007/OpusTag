import requests
import os
from typing import List, Dict, Optional

def search_albums(query: str, country: str = "US", limit: int = 10) -> List[Dict]:
    """
    Search iTunes Store for albums.
    """
    base_url = "https://itunes.apple.com/search"
    params = {
        "term": query,
        "country": country,
        "media": "music",
        "entity": "album",
        "limit": limit
    }
    
    try:
        response = requests.get(base_url, params=params)
        response.raise_for_status()
        return response.json().get("results", [])
    except requests.RequestException as e:
        print(f"Error searching iTunes: {e}")
        return []

def get_high_res_url(artwork_url: str, size: str = "10000x10000") -> str:
    """
    Constructs the high-res URL safely.
    """
    if not artwork_url:
        return ""
        
    try:
        base, filename = artwork_url.rsplit('/', 1)
        _, ext = os.path.splitext(filename)
        return f"{base}/{size}bb{ext}"
    except Exception:
        return artwork_url
