const TABS = [
  { id: 'itinerary', label: 'Itinerary', icon: '📅' },
  { id: 'map',       label: 'Map',       icon: '🗺️' },
  { id: 'packing',   label: 'Packing',   icon: '🎒' },
  { id: 'vote',      label: 'Vote',      icon: '🗳️' },
];

export default function TabNav({ activeTab, setActiveTab }) {
  return (
    <div className="flex border-b border-slate-100">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 text-xs font-semibold transition-all border-b-2 ${
            activeTab === tab.id
              ? 'border-teal-500 text-teal-600'
              : 'border-transparent text-slate-400 hover:text-slate-600 hover:border-slate-200'
          }`}
        >
          <span className="text-lg leading-none">{tab.icon}</span>
          <span className="tracking-wide uppercase text-[10px]">{tab.label}</span>
        </button>
      ))}
    </div>
  );
}
