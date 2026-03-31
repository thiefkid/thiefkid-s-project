const TABS = [
  { id: 'itinerary', label: 'Itinerary', icon: '📅' },
  { id: 'map',       label: 'Map',       icon: '🗺️' },
  { id: 'packing',   label: 'Packing',   icon: '🎒' },
  { id: 'vote',      label: 'Vote',      icon: '🗳️' },
];

export default function TabNav({ activeTab, setActiveTab }) {
  return (
    <div className="flex">
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex flex-col items-center justify-center gap-1 py-2.5 transition-all active:scale-95 ${
              isActive ? 'text-teal-600' : 'text-slate-400'
            }`}
          >
            {/* Active dot indicator */}
            <span
              className={`w-1 h-1 rounded-full transition-all duration-200 ${
                isActive ? 'bg-teal-500 scale-100' : 'scale-0'
              }`}
            />
            <span className={`text-2xl leading-none transition-transform duration-200 ${isActive ? 'scale-110' : 'scale-100'}`}>
              {tab.icon}
            </span>
            <span className={`text-[10px] font-bold tracking-wide uppercase transition-colors ${
              isActive ? 'text-teal-600' : 'text-slate-400'
            }`}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
