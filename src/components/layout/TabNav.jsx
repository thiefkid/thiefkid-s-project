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
            className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2 transition-all active:opacity-60 ${
              isActive ? 'text-teal-600' : 'text-slate-400'
            }`}
          >
            <span className={`text-xl leading-none transition-transform duration-150 ${isActive ? 'scale-110' : 'scale-100'}`}>
              {tab.icon}
            </span>
            <span className="text-[10px] font-bold tracking-wide uppercase">
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
