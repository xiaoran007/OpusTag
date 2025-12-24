import uvicorn
import argparse
import webbrowser
import threading
import time
import os

def start_browser(url):
    time.sleep(1.5)
    webbrowser.open(url)

def main():
    parser = argparse.ArgumentParser(description="OpusTag - Classical Music Manager")
    parser.add_argument("--host", default="0.0.0.0", help="Host to bind to")
    parser.add_argument("--port", type=int, default=8000, help="Port to bind to")
    parser.add_argument("--no-browser", action="store_true", help="Do not open browser automatically")
    parser.add_argument("--music-dir", help="Path to music directory to scan on startup")
    
    args = parser.parse_args()

    # If music dir is provided via CLI, we might want to store it or use it
    # For now, we can just print it, or potentially set an env var
    if args.music_dir:
        os.environ["OPUSTAG_MUSIC_DIR"] = args.music_dir
        print(f"Music directory set to: {args.music_dir}")

    url = f"http://{args.host}:{args.port}"
    print(f"Starting OpusTag at {url}")

    if not args.no_browser:
        threading.Thread(target=start_browser, args=(url,), daemon=True).start()

    uvicorn.run("opustag.main:app", host=args.host, port=args.port, log_level="info")

if __name__ == "__main__":
    main()
