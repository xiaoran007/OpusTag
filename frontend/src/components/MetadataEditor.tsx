import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';

interface MetadataEditorProps {
  initialData: {
    title: string;
    artist: string;
    year: string;
    genre?: string;
    composer?: string;
  };
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
}

export function MetadataEditor({ initialData, onClose, onSave }: MetadataEditorProps) {
  const [formData, setFormData] = useState(initialData);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(formData);
    } catch (err) {
      console.error(err);
      alert("Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#1e1e1e] w-full max-w-lg rounded-2xl shadow-2xl border border-white/10 overflow-hidden ring-1 ring-white/10">
        <div className="p-4 border-b border-white/5 flex items-center justify-between bg-[#252527]">
            <h2 className="text-sm font-semibold text-white tracking-wide">Edit Album Metadata</h2>
            <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full text-white/60 hover:text-white transition-colors">
                <X className="w-4 h-4" />
            </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-white/40 tracking-wider">Album Title</label>
                <input 
                    type="text" 
                    value={formData.title} 
                    onChange={e => setFormData({...formData, title: e.target.value})}
                    className="w-full bg-[#2c2c2e] border border-white/5 rounded-lg p-2.5 text-sm text-white focus:ring-1 focus:ring-apple-red outline-none transition-all"
                />
            </div>
            
            <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-white/40 tracking-wider">Album Artist</label>
                <input 
                    type="text" 
                    value={formData.artist} 
                    onChange={e => setFormData({...formData, artist: e.target.value})}
                    className="w-full bg-[#2c2c2e] border border-white/5 rounded-lg p-2.5 text-sm text-white focus:ring-1 focus:ring-apple-red outline-none transition-all"
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-white/40 tracking-wider">Year</label>
                    <input 
                        type="text" 
                        value={formData.year} 
                        onChange={e => setFormData({...formData, year: e.target.value})}
                        className="w-full bg-[#2c2c2e] border border-white/5 rounded-lg p-2.5 text-sm text-white focus:ring-1 focus:ring-apple-red outline-none transition-all"
                    />
                </div>
                <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-white/40 tracking-wider">Genre</label>
                    <input 
                        type="text" 
                        value={formData.genre || ''} 
                        onChange={e => setFormData({...formData, genre: e.target.value})}
                        className="w-full bg-[#2c2c2e] border border-white/5 rounded-lg p-2.5 text-sm text-white focus:ring-1 focus:ring-apple-red outline-none transition-all"
                        placeholder="Classical"
                    />
                </div>
            </div>

             <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-white/40 tracking-wider">Composer</label>
                <input 
                    type="text" 
                    value={formData.composer || ''} 
                    onChange={e => setFormData({...formData, composer: e.target.value})}
                    className="w-full bg-[#2c2c2e] border border-white/5 rounded-lg p-2.5 text-sm text-white focus:ring-1 focus:ring-apple-red outline-none transition-all"
                    placeholder="Bach, Beethoven, etc."
                />
            </div>

            <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={onClose} className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm font-medium text-white/80 transition-colors">
                    Cancel
                </button>
                <button type="submit" disabled={saving} className="px-6 py-2 bg-apple-red hover:bg-red-500 rounded-lg text-sm font-medium text-white transition-colors flex items-center gap-2">
                    {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                    Save Changes
                </button>
            </div>
        </form>
      </div>
    </div>
  );
}
