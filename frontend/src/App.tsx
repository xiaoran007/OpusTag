import { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { SearchView } from '@/views/SearchView';
import { LibraryView } from '@/views/LibraryView';
import { Library } from 'lucide-react';

type Tab = 'search' | 'library' | 'settings';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('search');

  return (
    <div className="h-screen w-screen bg-[#1c1c1e] text-white overflow-hidden grid grid-cols-[240px_1fr]">
      
      {/* Col 1: Sidebar */}
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Col 2: Main Content */}
      <div className="relative h-full overflow-hidden bg-[#1c1c1e]">
        
        {activeTab === 'search' && <SearchView />}
        
        {activeTab === 'library' && <LibraryView />}

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