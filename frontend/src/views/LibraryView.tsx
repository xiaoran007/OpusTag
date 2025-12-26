import { useState, useEffect } from 'react';
import axios from 'axios';
import { Disc, Music, Loader2, RefreshCw } from 'lucide-react';
import { clsx } from 'clsx';
import { AlbumDetail } from '@/views/AlbumDetail';

interface Track {
  path: string;
  title: string;
  artist: string;
  track_number: string;
}

interface LocalAlbum {
  id: string;
  title: string;
  artist: string;
  year: string;
  track_count: number;
  sample_file: string;
  has_cover: boolean;
  tracks: Track[];
}

export function LibraryView() {
  const [albums, setAlbums] = useState<LocalAlbum[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  // Cache busting state
  const [coverVersion, setCoverVersion] = useState(Date.now());
  
  // Selection State
  const [selectedAlbum, setSelectedAlbum] = useState<LocalAlbum | null>(null);

  const fetchLibrary = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.post<LocalAlbum[]>('/api/library/scan', {});
      setAlbums(response.data);
      // Update version to force image reload
      setCoverVersion(Date.now());
    } catch (err) {
      console.error(err);
      setError('Failed to scan library.');
    } finally {
      setLoading(false);
    }
  };

  // Auto-load on mount
  useEffect(() => {
    fetchLibrary();
  }, []);

  const getCoverUrl = (path: string) => {
    // We must encode the path because it contains slashes
    // Add timestamp to bust cache
    return `/api/library/cover?path=${encodeURIComponent(path)}&t=${coverVersion}`;
  };

  const handleRefresh = () => {
    fetchLibrary();
    setSelectedAlbum(null); // Close detail view after refresh to see changes on grid
  };

  return (
    <div className="h-full w-full flex flex-col bg-[#1c1c1e] relative">
      
      {/* Header */}
      <div className="shrink-0 p-8 pb-4 w-full z-10 flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-white">Library</h1>
        <button 
            onClick={fetchLibrary}
            disabled={loading}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white/80 transition-colors disabled:opacity-50"
            title="Rescan Library"
        >
            <RefreshCw className={clsx("w-5 h-5", loading && "animate-spin")} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-8 pb-8 custom-scrollbar w-full">
            
            {/* Loading State */}
            {loading && albums.length === 0 && (
                <div className="h-64 flex flex-col items-center justify-center opacity-60">
                    <Loader2 className="w-10 h-10 animate-spin text-apple-red mb-4" />
                    <p className="text-sm font-medium text-white/50">Scanning Local Files...</p>
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-center text-sm mb-8">
                    {error}
                </div>
            )}

            {/* Empty State */}
            {!loading && albums.length === 0 && !error && (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-20 pb-20">
                    <Music className="w-16 h-16 mb-6" />
                    <p className="text-base font-medium">No albums found.</p>
                </div>
            )}

            {/* Albums Grid */}
            {albums.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-6 pb-20">
                    {albums.map((album) => (
                        <div 
                            key={album.id} 
                            onClick={() => setSelectedAlbum(album)}
                            className="group flex flex-col gap-3.5 cursor-pointer"
                        >
                            
                            {/* Artwork Card */}
                            <div className="relative aspect-square overflow-hidden rounded-[14px] bg-[#2c2c2e] shadow-lg ring-1 ring-white/5 group-hover:ring-white/20 transition-all duration-300 transform group-hover:scale-[1.02]">
                                {album.has_cover ? (
                                    <img 
                                        src={getCoverUrl(album.sample_file)} 
                                        alt={album.title}
                                        className="w-full h-full object-cover transition-transform duration-500"
                                        loading="lazy"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-[#2c2c2e] group-hover:bg-[#3a3a3c] transition-colors">
                                        <Disc className="w-16 h-16 text-white/10" />
                                    </div>
                                )}
                                
                                {/* Overlay */}
                                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                            </div>

                            {/* Metadata */}
                            <div className="space-y-1">
                                <h3 className="font-medium text-[13px] text-white/90 line-clamp-2 leading-snug group-hover:text-apple-red transition-colors">
                                    {album.title}
                                </h3>
                                <p className="text-[12px] text-white/50 line-clamp-1">
                                    {album.artist}
                                </p>
                                <div className="flex items-center gap-2 pt-0.5">
                                    <span className="inline-block text-[10px] font-medium text-white/30 tracking-wide bg-white/5 px-1.5 py-px rounded-[4px]">
                                        {album.year || "Unknown"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
      </div>

      {/* Detail Modal Overlay */}
      {selectedAlbum && (
        <AlbumDetail 
            album={selectedAlbum} 
            onClose={() => setSelectedAlbum(null)} 
            onRefresh={handleRefresh}
        />
      )}
    </div>
  );
}