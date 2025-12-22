import { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { SearchView } from '@/views/SearchView';
import { Library } from 'lucide-react';

type Tab = 'search' | 'library' | 'settings';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('search');

  return (
    // 使用 CSS Grid 布局：左侧固定 240px (w-60)，右侧自动填满 (1fr)
    // 这比 Flexbox 更稳定，彻底防止布局塌陷
    <div className="h-screen w-screen bg-[#1c1c1e] text-white overflow-hidden grid grid-cols-[240px_1fr]">
      
      {/* Col 1: Sidebar */}
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Col 2: Main Content */}
      <div className="relative h-full overflow-hidden bg-[#1c1c1e]">
        
        {activeTab === 'search' && <SearchView />}
        
        {activeTab === 'library' && (
          <div className="h-full flex flex-col items-center justify-center text-white/30 animate-in fade-in duration-300">
            <Library className="w-16 h-16 mb-4 opacity-50" />
            <h2 className="text-xl font-medium mb-2">Local Library</h2>
            <p className="text-sm">File browser coming soon...</p>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="h-full flex flex-col items-center justify-center text-white/30 animate-in fade-in duration-300">
            <h2 className="text-xl font-medium">Settings</h2>
            <p className="text-sm mt-2">Configuration options will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
