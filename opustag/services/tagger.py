import os
import hashlib
from typing import Dict, List, Any, Optional
import requests
from mutagen.flac import FLAC, Picture

class TaggerService:
    def __init__(self):
        pass

    def _generate_album_id(self, artist: str, album: str) -> str:
        """Generates a stable ID for an album based on artist and name."""
        raw = f"{artist or 'Unknown'} - {album or 'Unknown'}".strip().lower()
        return hashlib.md5(raw.encode('utf-8')).hexdigest()

    def scan_library(self, root_path: str) -> List[Dict[str, Any]]:
        """
        Scans directory and returns a list of Albums aggregated from tracks.
        """
        albums_map = {}

        if not os.path.exists(root_path):
            print(f"Path does not exist: {root_path}")
            return []

        # Walk through directories
        for root, _, files in os.walk(root_path):
            for file in files:
                if file.lower().endswith('.flac'):
                    full_path = os.path.join(root, file)
                    try:
                        meta = self.get_metadata(full_path)
                        if not meta:
                            continue
                        
                        # Determine effective artist for grouping (prefer Album Artist)
                        effective_artist = meta['album_artist'] if meta.get('album_artist') else meta['artist']
                        
                        # Generate Album ID
                        album_id = self._generate_album_id(effective_artist, meta['album'])
                        
                        # Initialize Album entry if new
                        if album_id not in albums_map:
                            albums_map[album_id] = {
                                "id": album_id,
                                "title": meta['album'] or "Unknown Album",
                                "artist": effective_artist or "Unknown Artist",
                                "year": meta['year'],
                                "genre": meta.get('genre'),
                                "composer": meta.get('composer'),
                                "tracks": [],
                                "sample_file": full_path, # Keep one file path to extract cover later
                                "has_cover": False
                            }
                        
                        # Add track info
                        albums_map[album_id]["tracks"].append(meta)
                        
                        # If any track has a cover, the album has a cover
                        if meta['has_cover']:
                            albums_map[album_id]["has_cover"] = True
                        
                    except Exception as e:
                        print(f"Error scanning {file}: {e}")
        
        # Convert map to list and sort
        results = []
        for album in albums_map.values():
            # Sort tracks by track number
            album["tracks"].sort(key=lambda x: self._parse_track_number(x.get("track_number")))
            album["track_count"] = len(album["tracks"])
            results.append(album)
            
        return results

    def _parse_track_number(self, track_str: str) -> int:
        if not track_str: return 999
        try:
            return int(track_str.split('/')[0])
        except:
            return 999

    def get_metadata(self, file_path: str) -> Optional[Dict[str, Any]]:
        try:
            audio = FLAC(file_path)
            
            def get(key, default=""):
                return audio.get(key, [default])[0]

            return {
                "path": file_path,
                "title": get("title", os.path.basename(file_path)),
                "artist": get("artist"),
                "album_artist": get("albumartist"),
                "album": get("album"),
                "year": get("date"),
                "genre": get("genre"),
                "composer": get("composer"),
                "track_number": get("tracknumber", "0"),
                "has_cover": len(audio.pictures) > 0
            }
        except Exception:
            return None

    def get_cover_data(self, file_path: str) -> Optional[bytes]:
        """Extracts the raw bytes of the cover art from a FLAC file."""
        try:
            audio = FLAC(file_path)
            if audio.pictures:
                return audio.pictures[0].data
            return None
        except Exception:
            return None

    def embed_cover_from_url(self, file_paths: List[str], image_url: str):
        """Downloads image and embeds it into multiple FLAC files."""
        # Download image
        try:
            response = requests.get(image_url)
            response.raise_for_status()
            image_data = response.content
            mime_type = response.headers.get('Content-Type', 'image/jpeg')
        except Exception as e:
            raise Exception(f"Failed to download image: {e}")

        # Create Picture object
        pic = Picture()
        pic.type = 3 # Front Cover
        pic.mime = mime_type
        pic.desc = "Cover"
        pic.data = image_data

        # Embed
        for path in file_paths:
            try:
                audio = FLAC(path)
                audio.clear_pictures() # Remove old covers
                audio.add_picture(pic)
                audio.save()
            except Exception as e:
                print(f"Failed to embed cover for {path}: {e}")

    def update_album_metadata(self, file_paths: List[str], tags: Dict[str, str]):
        """
        Updates tags for multiple files.
        """
        for path in file_paths:
            try:
                audio = FLAC(path)
                
                if 'artist' in tags: audio['artist'] = tags['artist']
                if 'album' in tags: audio['album'] = tags['album']
                if 'year' in tags: audio['date'] = tags['year']
                if 'genre' in tags: audio['genre'] = tags['genre']
                if 'composer' in tags: audio['composer'] = tags['composer']
                
                audio.save()
            except Exception as e:
                print(f"Failed to update tags for {path}: {e}")

# Singleton
tagger_service = TaggerService()