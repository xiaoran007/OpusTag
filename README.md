# OpusTag

<!-- [![Downloads](https://static.pepy.tech/badge/opustag)](https://pepy.tech/project/opustag) -->
![Docker Pulls](https://img.shields.io/docker/pulls/xiaoran007/opustag)
![PyPI - Version](https://img.shields.io/pypi/v/opustag?label=version)

![Static Badge](https://img.shields.io/badge/amd64-green)
![Static Badge](https://img.shields.io/badge/aarch64-blue)

**OpusTag** is a modern, elegant audio metadata manager designed specifically for classical music collectors. It combines a powerful local library organizer with an integrated high-resolution cover art fetcher powered by the iTunes API.

<!-- ![Library View Placeholder](https://placehold.co/1200x800/1c1c1e/ffffff?text=Library+View+Screenshot) -->

## ✨ Features

- **Apple Music-Inspired UI**: A clean, dark-mode interface with frosted glass effects and fluid animations.
- **High-Res Cover Art**: Search and download original artwork (up to 3000px+) directly from Apple's servers.
- **One-Click Embedding**: Automatically match and embed cover art into your FLAC files.
- **Metadata Editing**: Edit album titles, artists, years, genres, and composers with a streamlined bulk editor.
- **Local Library**: Scan your local music folder and visualize your collection in a beautiful grid.
- **Dockerized**: Fully containerized for easy deployment and isolation.

## 🚀 Getting Started

OpusTag can be installed as a Python package or run via Docker.

### Prerequisites

- A folder containing your music collection (FLAC format recommended).

### Installation (Pip)

Install the latest version from PyPI:

```bash
pip install opustag
```

Start the application pointing to your music directory:

```bash
opustag --music-dir /path/to/your/music
```

This will launch the server and open your default web browser to the OpusTag interface.

### Installation (Docker)

Pull and run the pre-built image from Docker Hub:

```bash
docker run -d \
  -p 8000:8000 \
  -v /path/to/your/music:/music \
  xiaoran007/opustag:latest
```

The application will be available at **[http://localhost:8000](http://localhost:8000)**.

### Development (Build from Source)

If you want to contribute or build from source:

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/xiaoran007/OpusTag.git
    cd OpusTag
    ```

2.  **Install dependencies:**
    ```bash
    pip install -e .
    ```

3.  **Run Development Server:**
    ```bash
    uvicorn opustag.main:app --reload
    ```
    *Note: For frontend development, you will also need to run the Vite dev server inside the `frontend/` directory.*

## 📖 Usage Guide

### 1. Searching for Artwork
- Go to the **Search** tab (default view).
- Type an artist, album, or composer name (e.g., *"Karajan Beethoven 9"*).
- Browse high-resolution results from Apple Music.
- Click the **Search Icon** to view the full-size original image in a new tab.
- Click the **Download Icon** to save the image locally.

### 2. Managing Your Library
- Switch to the **Library** tab via the sidebar.
- Click the **Refresh** button to scan your mapped music folder.
- Your albums will appear in a grid. Albums missing covers will show a placeholder disc icon.

### 3. Editing & Embedding
- Click on any album to open the **Detail View**.
- **Add/Replace Cover**: Click **"Auto-Match / Replace Cover"**. A search window will appear pre-filled with the album's info. Select the correct cover, and OpusTag will automatically download and embed it into all tracks of that album.
- **Edit Tags**: Click **"Edit Metadata"** to modify the Album Artist, Title, Year, Genre, or Composer. Changes are applied in bulk to all tracks.


## 📝 License

This project is open-source and available under the [GPL v3](LICENSE).