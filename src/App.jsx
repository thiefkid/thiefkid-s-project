import { useState } from 'react';
import Header from './components/layout/Header.jsx';
import TabNav from './components/layout/TabNav.jsx';
import ItineraryView from './components/itinerary/ItineraryView.jsx';
import MapView from './components/map/MapView.jsx';
import PackingView from './components/packing/PackingView.jsx';

export default function App() {
  const [activeTab, setActiveTab] = useState('itinerary');

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <div className="sticky top-0 z-40 bg-white shadow-sm">
        <div className="max-w-2xl mx-auto">
          <TabNav activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
      </div>
      <main className="max-w-2xl mx-auto px-4 pb-8">
        {activeTab === 'itinerary' && <ItineraryView />}
        {activeTab === 'map' && <MapView />}
        {activeTab === 'packing' && <PackingView />}
      </main>
    </div>
  );
}
