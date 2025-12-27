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

    def _process_file(self, full_path: str, albums_map: Dict[str, Any]):
        try:
            meta = self.get_metadata(full_path)
            if not meta:
                return
            
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
            print(f"Error scanning {full_path}: {e}")

    def _finalize_albums(self, albums_map: Dict[str, Any]) -> List[Dict[str, Any]]:
        # Convert map to list and sort
        results = []
        for album in albums_map.values():
            # Sort tracks by track number
            album["tracks"].sort(key=lambda x: self._parse_track_number(x.get("track_number")))
            album["track_count"] = len(album["tracks"])
            results.append(album)
        return results

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
                    self._process_file(full_path, albums_map)
        
        return self._finalize_albums(albums_map)

    def get_albums_from_paths(self, file_paths: List[str]) -> List[Dict[str, Any]]:
        albums_map = {}
        for path in file_paths:
            if os.path.exists(path) and path.lower().endswith('.flac'):
                self._process_file(path, albums_map)
        return self._finalize_albums(albums_map)

    def _parse_track_number(self, track_str: str) -> int:
        if not track_str: return 999
        try:
            return int(track_str.split('/')[0])
        except:
            return 999

    def _find_local_cover(self, directory: str) -> Optional[str]:
        """Scans directory for cover art files (Navidrome compatible)."""
        base_names = ["cover", "folder", "front", "artwork"]
        extensions = ["jpg", "jpeg", "png", "gif", "bmp"]
        
        try:
            if not os.path.exists(directory):
                return None
                
            files = os.listdir(directory)
            # Create a map for case-insensitive lookup
            files_map = {f.lower(): f for f in files}
            
            for base in base_names:
                for ext in extensions:
                    candidate = f"{base}.{ext}"
                    if candidate in files_map:
                        return os.path.join(directory, files_map[candidate])
        except Exception:
            pass
        return None

    def get_metadata(self, file_path: str) -> Optional[Dict[str, Any]]:
        try:
            audio = FLAC(file_path)
            
            def get(key, default=""):
                return audio.get(key, [default])[0]

            directory = os.path.dirname(file_path)
            has_local_cover = self._find_local_cover(directory) is not None
            has_embedded_cover = len(audio.pictures) > 0

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
                "has_cover": has_embedded_cover or has_local_cover
            }
        except Exception:
            return None

    def get_cover_data(self, file_path: str) -> Optional[bytes]:
        """Extracts cover art: checks local file first, then embedded tags."""
        try:
            # 1. Check local file
            directory = os.path.dirname(file_path)
            local_cover_path = self._find_local_cover(directory)
            if local_cover_path:
                with open(local_cover_path, "rb") as f:
                    return f.read()

            # 2. Check embedded tags
            audio = FLAC(file_path)
            if audio.pictures:
                return audio.pictures[0].data
            return None
        except Exception:
            return None

    def embed_cover_from_url(self, file_paths: List[str], image_url: str):
        """Downloads image, saves as local file, and embeds into FLAC files."""
        # Download image
        try:
            response = requests.get(image_url)
            response.raise_for_status()
            image_data = response.content
            mime_type = response.headers.get('Content-Type', 'image/jpeg')
        except Exception as e:
            raise Exception(f"Failed to download image: {e}")

        # Save to local file (overwrite existing or create new)
        if file_paths:
            try:
                # Use the directory of the first file
                first_file_dir = os.path.dirname(file_paths[0])
                
                # Determine extension based on mime type for new files
                ext = "jpg"
                if mime_type == "image/png": ext = "png"
                elif mime_type == "image/gif": ext = "gif"

                # Check for existing cover to overwrite
                existing_cover = self._find_local_cover(first_file_dir)
                
                if existing_cover:
                    cover_path = existing_cover
                    print(f"Overwriting existing cover: {cover_path}")
                else:
                    cover_path = os.path.join(first_file_dir, f"cover.{ext}")
                    print(f"Creating new cover: {cover_path}")

                with open(cover_path, "wb") as f:
                    f.write(image_data)
            except Exception as e:
                print(f"Failed to save local cover file: {e}")

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