import { Search, Library, Settings, Disc } from 'lucide-react';
import clsx from 'clsx';

type Tab = 'search' | 'library' | 'settings';

interface SidebarProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const navItems = [
    { id: 'search', label: 'Search', icon: Search },
    { id: 'library', label: 'Library', icon: Library },
    { id: 'settings', label: 'Settings', icon: Settings },
  ] as const;

  return (
    <aside className="bg-[#1e1e1e]/80 backdrop-blur-xl border-r border-white/5 flex flex-col pt-6 pb-4 z-50">
      {/* App Logo Area - Cleaned up shadow */}
      <div className="px-6 mb-8 flex items-center gap-2.5 opacity-90">
        <div className="w-6 h-6 bg-apple-red rounded text-white flex items-center justify-center">
          <Disc className="w-4 h-4" />
        </div>
        <span className="font-semibold text-[15px] tracking-tight text-white/90">OpusTag</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-0.5">
        <div className="px-3 pb-2">
            <h3 className="text-[11px] font-semibold text-white/40 uppercase tracking-wider">Discover</h3>
        </div>
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;
          
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={clsx(
                "w-full flex items-center gap-3 px-3 py-2 rounded-md text-[14px] font-medium transition-colors duration-200 group",
                isActive 
                  ? "bg-white/10 text-apple-red" 
                  : "text-white/60 hover:text-white hover:bg-white/5"
              )}
            >
              <Icon className={clsx(
                "w-4.5 h-4.5 transition-colors", 
                isActive ? "text-apple-red" : "text-white/50 group-hover:text-white"
              )} />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Footer / Status */}
      <div className="px-6 py-4 border-t border-white/5 mt-auto">
        <div className="flex items-center gap-2.5">
           <div className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </div>
           <span className="text-[10px] font-medium tracking-wide text-white/40">BACKEND ONLINE</span>
        </div>
      </div>
    </aside>
  );
}