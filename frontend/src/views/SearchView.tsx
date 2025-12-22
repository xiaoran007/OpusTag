import { useState } from 'react';
import axios from 'axios';
import { Search, Download, Loader2, SlidersHorizontal, ArrowRight } from 'lucide-react';
import { clsx } from 'clsx';

interface Album {
  collectionId: number;
  artistName: string;
  collectionName: string;
  releaseDate: string;
  artworkUrl100: string;
  artworkUrlPreview: string;
  artworkUrlHighRes: string;
  copyright?: string;
}

export function SearchView() {
  const [query, setQuery] = useState('');
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [limit, setLimit] = useState(20);
  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError('');

    try {
      const response = await axios.get<Album[]>(`/api/search/?q=${encodeURIComponent(query)}&limit=${limit}`);
      setAlbums(response.data);
    } catch (err) {
      setError('iTunes connection failed.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const downloadImage = async (url: string, filename: string) => {
    try {
      const response = await axios.get(url, { responseType: 'blob' });
      const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = blobUrl;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Download failed", err);
    }
  };

  return (
    <div className="h-full w-full flex flex-col bg-[#1c1c1e]">
      
      {/* 1. Header Area */}
      <div className="shrink-0 p-8 pb-4 w-full z-10">
        <div className="w-full">
            <form onSubmit={handleSearch} className="w-full relative">
                {/* Icon */}
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">
                    <Search className="w-5 h-5" />
                </div>
                
                {/* Input */}
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search Apple Music..."
                    className="block w-full bg-[#2c2c2e] hover:bg-[#3a3a3c] focus:bg-[#2c2c2e] text-[15px] text-white placeholder-white/30 rounded-xl py-4 pl-12 pr-12 outline-none border-none focus:ring-2 focus:ring-apple-red transition-all duration-200"
                />

                {/* Right Actions */}
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                     <button 
                        type="button"
                        onClick={() => setShowFilters(!showFilters)}
                        className={clsx(
                            "p-2 rounded-lg transition-colors",
                            showFilters ? "text-white bg-white/10" : "text-white/30 hover:text-white"
                        )}
                    >
                        <SlidersHorizontal className="w-4 h-4" />
                    </button>
                    {query && !loading && (
                        <button type="submit" className="p-2 bg-apple-red text-white rounded-lg hover:bg-red-500 transition-colors">
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </form>

            {/* Filters */}
            {showFilters && (
                <div className="mt-3 pl-1 flex items-center gap-4 text-xs font-medium text-white/50 animate-in slide-in-from-top-2 fade-in">
                    <span>Results: <span className="text-apple-red">{limit}</span></span>
                    <input 
                        type="range" 
                        min="5" 
                        max="50" 
                        step="5" 
                        value={limit} 
                        onChange={(e) => setLimit(Number(e.target.value))}
                        className="w-48 accent-apple-red h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                    />
                </div>
            )}
        </div>
      </div>

      {/* 2. Content Area */}
      <div className="flex-1 overflow-y-auto px-8 pb-8 custom-scrollbar w-full">
            
            {/* Loading */}
            {loading && (
                <div className="h-64 flex flex-col items-center justify-center opacity-60">
                    <Loader2 className="w-10 h-10 animate-spin text-apple-red mb-4" />
                    <p className="text-sm font-medium text-white/50">Searching...</p>
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
                    <Search className="w-16 h-16 mb-6" />
                    <p className="text-base font-medium">Enter keywords to explore.</p>
                </div>
            )}

            {/* Results Grid */}
            {albums.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-6">
                    {albums.map((album) => (
                        <div key={album.collectionId} className="group flex flex-col gap-3.5">
                            <div className="relative aspect-square overflow-hidden rounded-[14px] bg-[#2c2c2e] shadow-lg ring-1 ring-white/5 group-hover:ring-white/20 transition-all duration-300">
                                <img 
                                    src={album.artworkUrlPreview} 
                                    alt={album.collectionName}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    loading="lazy"
                                />
                                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-3">
                                    <a href={album.artworkUrlHighRes} target="_blank" rel="noreferrer" className="p-3 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-md text-white transition-transform hover:scale-110 active:scale-95">
                                        <Search className="w-5 h-5" />
                                    </a>
                                    <button onClick={() => {
                                        const safeName = `${album.artistName} - ${album.collectionName}`.replace(/[\\/*?:"<>|]/g, "");
                                        downloadImage(album.artworkUrlHighRes, `${safeName}.jpg`);
                                    }} className="p-3 bg-apple-red hover:bg-red-500 rounded-full text-white transition-transform hover:scale-110 active:scale-95">
                                        <Download className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <h3 className="font-medium text-[13px] text-white/90 line-clamp-2 leading-snug group-hover:text-apple-red transition-colors">
                                    {album.collectionName}
                                </h3>
                                <p className="text-[12px] text-white/50 line-clamp-1">
                                    {album.artistName}
                                </p>
                                <span className="inline-block text-[10px] font-medium text-white/30 tracking-wide bg-white/5 px-1.5 py-px rounded-[4px] mt-0.5">
                                    {album.releaseDate.substring(0, 4)}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
      </div>
    </div>
  );
}
