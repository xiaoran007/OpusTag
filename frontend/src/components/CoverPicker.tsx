import { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Loader2, X, Check } from 'lucide-react';
import { clsx } from 'clsx';

interface Album {
  collectionId: number;
  artistName: string;
  collectionName: string;
  releaseDate: string;
  artworkUrl100: string;
  artworkUrlPreview: string; // 600x600
  artworkUrlHighRes: string; // 10000x10000
}

interface CoverPickerProps {
  initialQuery: string;
  onClose: () => void;
  onSelect: (imageUrl: string) => Promise<void>;
}

export function CoverPicker({ initialQuery, onClose, onSelect }: CoverPickerProps) {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<Album[]>([]);
  const [loading, setLoading] = useState(false);
  const [processingId, setProcessingId] = useState<number | null>(null); // ID of album being embedded
  const [error, setError] = useState('');

  // Auto-search on mount
  useEffect(() => {
    if (initialQuery) {
      handleSearch();
    }
  }, []);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError('');
    try {
      const response = await axios.get<Album[]>(`/api/search/?q=${encodeURIComponent(query)}&limit=15`);
      setResults(response.data);
    } catch (err) {
      setError('Search failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = async (album: Album) => {
    setProcessingId(album.collectionId);
    try {
      await onSelect(album.artworkUrlHighRes);
    } catch (err) {
      console.error(err);
      alert("Failed to embed cover.");
      setProcessingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#1e1e1e] w-full max-w-4xl h-[80vh] rounded-2xl shadow-2xl border border-white/10 flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="shrink-0 p-4 border-b border-white/5 flex items-center gap-4">
          <form onSubmit={handleSearch} className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input 
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-[#2c2c2e] text-sm text-white rounded-lg py-2.5 pl-9 pr-4 outline-none focus:ring-1 focus:ring-apple-red"
              placeholder="Refine search..."
              autoFocus
            />
          </form>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X className="w-5 h-5 text-white/60" />
          </button>
        </div>

        {/* Results Grid */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-[#1c1c1e]">
          {loading && !results.length && (
             <div className="flex justify-center py-20">
               <Loader2 className="w-8 h-8 animate-spin text-apple-red" />
             </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {results.map((album) => (
              <div 
                key={album.collectionId} 
                onClick={() => !processingId && handleSelect(album)}
                className={clsx(
                  "group relative cursor-pointer rounded-xl overflow-hidden bg-[#2c2c2e] ring-1 ring-white/5 transition-all duration-200",
                  processingId === album.collectionId ? "opacity-100 ring-apple-red ring-2 scale-95" : "hover:scale-105 hover:ring-white/20",
                  processingId && processingId !== album.collectionId && "opacity-40 grayscale"
                )}
              >
                <div className="aspect-square relative">
                  <img src={album.artworkUrlPreview} className="w-full h-full object-cover" loading="lazy" />
                  
                  {/* Processing Overlay */}
                  {processingId === album.collectionId && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm">
                      <Loader2 className="w-8 h-8 text-white animate-spin" />
                    </div>
                  )}

                  {/* Hover Overlay */}
                  {!processingId && (
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="bg-apple-red/90 text-white text-xs font-medium px-3 py-1.5 rounded-full shadow-lg backdrop-blur-md">
                            Select
                        </span>
                    </div>
                  )}
                </div>
                
                <div className="p-3">
                  <p className="text-xs font-medium text-white/90 line-clamp-1">{album.collectionName}</p>
                  <p className="text-[10px] text-white/50 line-clamp-1">{album.artistName}</p>
                  <p className="text-[10px] text-white/30 mt-1">{album.releaseDate.substring(0, 4)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
