import { useState } from 'react';
import axios from 'axios';
import { X, Disc, Calendar, Layers, Wand2, Edit2 } from 'lucide-react';
import { CoverPicker } from '@/components/CoverPicker';
import { MetadataEditor } from '@/components/MetadataEditor';

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
  // Assuming backend returns these now or we default safely
  genre?: string;
  composer?: string;
}

interface AlbumDetailProps {
  album: LocalAlbum;
  onClose: () => void;
  onRefresh: () => void;
}

export function AlbumDetail({ album, onClose, onRefresh }: AlbumDetailProps) {
  const [showPicker, setShowPicker] = useState(false);
  const [showEditor, setShowEditor] = useState(false);

  const getCoverUrl = (path: string, bustCache = false) => {
    const base = `/api/library/cover?path=${encodeURIComponent(path)}`;
    return bustCache ? `${base}&t=${Date.now()}` : base;
  };

  const handleEmbedCover = async (imageUrl: string) => {
    try {
      const filePaths = album.tracks.map(t => t.path);
      await axios.post('/api/library/embed', {
        file_paths: filePaths,
        image_url: imageUrl
      });
      setShowPicker(false);
      onRefresh(); 
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const handleSaveMetadata = async (data: any) => {
    try {
      const filePaths = album.tracks.map(t => t.path);
      await axios.post('/api/library/update_meta', {
        file_paths: filePaths,
        artist: data.artist,
        album: data.title,
        year: data.year,
        genre: data.genre,
        composer: data.composer
      });
      setShowEditor(false);
      onRefresh();
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end sm:justify-center animate-in fade-in duration-200">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-5xl h-full sm:h-[90vh] bg-[#1c1c1e] sm:rounded-2xl shadow-2xl flex flex-col sm:flex-row overflow-hidden ring-1 ring-white/10">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 bg-black/20 hover:bg-white/10 rounded-full text-white/70 hover:text-white transition-colors backdrop-blur-md"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left: Artwork & Info */}
        <div className="w-full sm:w-[400px] bg-[#252527] border-b sm:border-b-0 sm:border-r border-white/5 flex flex-col">
          {/* Cover Image Area */}
          <div className="p-8 pb-4 flex flex-col items-center">
             <div className="relative aspect-square w-full max-w-[300px] shadow-2xl rounded-xl overflow-hidden bg-[#1c1c1e] ring-1 ring-black/20">
                {album.has_cover ? (
                  <img 
                    src={getCoverUrl(album.sample_file, true)} 
                    alt={album.title} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-[#2c2c2e]">
                    <Disc className="w-32 h-32 text-white/5" />
                  </div>
                )}
             </div>
          </div>

          {/* Metadata Display (Read Only) */}
          <div className="px-8 py-4 space-y-6 flex-1 overflow-y-auto text-center sm:text-left">
             <div className="space-y-1">
                <h2 className="text-2xl font-bold text-white leading-tight">{album.title}</h2>
                <p className="text-lg text-apple-red font-medium">{album.artist}</p>
             </div>

             <div className="space-y-3">
                <div className="flex items-center justify-center sm:justify-start gap-3 text-sm text-white/60">
                    <Calendar className="w-4 h-4 text-white/30" />
                    <span>{album.year || "Unknown Year"}</span>
                </div>
                <div className="flex items-center justify-center sm:justify-start gap-3 text-sm text-white/60">
                    <Layers className="w-4 h-4 text-white/30" />
                    <span>{album.track_count} Tracks</span>
                </div>
             </div>
          </div>

          {/* Footer Actions */}
          <div className="p-6 pt-0 mt-auto space-y-3">
              {/* Edit Metadata Button */}
              <button 
                  onClick={() => setShowEditor(true)}
                  className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-sm font-medium text-white/90 transition-colors flex items-center justify-center gap-2"
              >
                  <Edit2 className="w-4 h-4" />
                  Edit Metadata
              </button>

              {/* Auto Match Button */}
              <button 
                  onClick={() => setShowPicker(true)}
                  className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-sm font-medium text-white/90 transition-colors flex items-center justify-center gap-2 group"
              >
                  <Wand2 className="w-4 h-4 text-apple-red group-hover:animate-pulse" />
                  {album.has_cover ? "Replace Cover" : "Auto-Match Cover"}
              </button>
          </div>
        </div>

        {/* Right: Tracklist */}
        <div className="flex-1 bg-[#1c1c1e] overflow-y-auto custom-scrollbar flex flex-col">
            <div className="p-6 border-b border-white/5 sticky top-0 bg-[#1c1c1e]/95 backdrop-blur-sm z-10">
                <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wider">Tracks</h3>
            </div>
            
            <div className="p-2">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="text-xs text-white/30 border-b border-white/5">
                            <th className="px-4 py-2 w-12 text-center">#</th>
                            <th className="px-4 py-2">Title</th>
                            <th className="px-4 py-2">Artist</th>
                        </tr>
                    </thead>
                    <tbody>
                        {album.tracks.map((track, idx) => (
                            <tr key={idx} className="group hover:bg-white/5 transition-colors border-b border-white/[0.02]">
                                <td className="px-4 py-3 text-sm text-white/40 text-center font-mono">
                                    {track.track_number !== "0" ? track.track_number : idx + 1}
                                </td>
                                <td className="px-4 py-3 text-sm text-white/90 font-medium group-hover:text-white">
                                    {track.title}
                                </td>
                                <td className="px-4 py-3 text-sm text-white/50">
                                    {track.artist}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>

      </div>

      {/* Modals */}
      {showPicker && (
        <CoverPicker 
            initialQuery={`${album.artist} ${album.title}`}
            onClose={() => setShowPicker(false)}
            onSelect={handleEmbedCover}
        />
      )}

      {showEditor && (
        <MetadataEditor 
            initialData={{
                title: album.title,
                artist: album.artist,
                year: album.year,
                genre: album.genre,
                composer: album.composer
            }}
            onClose={() => setShowEditor(false)}
            onSave={handleSaveMetadata}
        />
      )}
    </div>
  );
}
