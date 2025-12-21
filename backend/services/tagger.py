import os
from typing import Dict, Any, Optional
import mutagen
from mutagen.flac import FLAC, Picture
from mutagen.mp3 import MP3
from mutagen.id3 import ID3, APIC, TIT2, TPE1, TALB, TYER

def scan_directory(path: str) -> list[Dict[str, Any]]:
    """
    Scans a directory for audio files and returns their metadata.
    Currently supports FLAC and MP3.
    """
    results = []
    if not os.path.exists(path) or not os.path.isdir(path):
        return []

    for root, _, files in os.walk(path):
        for file in files:
            if file.lower().endswith(('.flac', '.mp3')):
                full_path = os.path.join(root, file)
                try:
                    meta = get_metadata(full_path)
                    if meta:
                        results.append(meta)
                except Exception as e:
                    print(f"Error reading {file}: {e}")
    return results

def get_metadata(file_path: str) -> Optional[Dict[str, Any]]:
    """
    Extracts basic metadata (Artist, Album, Title, Year) from a file.
    """
    try:
        audio = mutagen.File(file_path)
        if audio is None:
            return None
        
        filename = os.path.basename(file_path)
        data = {
            "path": file_path,
            "filename": filename,
            "title": "",
            "artist": "",
            "album": "",
            "year": "",
            "has_cover": False
        }

        # Handling different formats
        # Mutagen EasyID3 or generic tags usually abstract this, 
        # but for specific control we might check types.
        # Simple extraction for now:
        
        if isinstance(audio, FLAC):
            data["title"] = audio.get("title", [""])[0]
            data["artist"] = audio.get("artist", [""])[0]
            data["album"] = audio.get("album", [""])[0]
            data["year"] = audio.get("date", [""])[0]
            data["has_cover"] = len(audio.pictures) > 0
            
        elif isinstance(audio, MP3):
            # MP3 tags can be messy (ID3v1, v2.3, v2.4). 
            # mutagen.File(mp3) usually returns an ID3-like object or MP3 object with tags.
            tags = audio.tags
            if tags:
                data["title"] = str(tags.get("TIT2", ""))
                data["artist"] = str(tags.get("TPE1", ""))
                data["album"] = str(tags.get("TALB", ""))
                data["year"] = str(tags.get("TDRC", "")) or str(tags.get("TYER", ""))
                data["has_cover"] = "APIC:" in tags or any(k.startswith("APIC") for k in tags.keys())

        # Fallback if empty
        if not data["title"]:
            data["title"] = os.path.splitext(filename)[0]

        return data
    except Exception as e:
        print(f"Error parsing metadata for {file_path}: {e}")
        return None
