const TABS = [
  { id: 'itinerary', label: 'Itinerary', icon: '📅' },
  { id: 'map', label: 'Map', icon: '🗺️' },
  { id: 'packing', label: 'Packing', icon: '🎒' },
];

export default function TabNav({ activeTab, setActiveTab }) {
  return (
    <div className="flex">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`flex-1 py-3 text-sm font-medium transition-colors border-b-2 ${
            activeTab === tab.id
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <span className="mr-1">{tab.icon}</span>
          {tab.label}
        </button>
      ))}
    </div>
  );
}
