import { useState } from 'react';
import Header from './components/layout/Header.jsx';
import TabNav from './components/layout/TabNav.jsx';
import ItineraryView from './components/itinerary/ItineraryView.jsx';
import MapView from './components/map/MapView.jsx';
import PackingView from './components/packing/PackingView.jsx';
import VoteView from './components/vote/VoteView.jsx';

export default function App() {
  const [activeTab, setActiveTab] = useState('itinerary');
  const [mapTarget, setMapTarget] = useState(null);

  const handleShowOnMap = ({ lat, lng, zoom = 15, label }) => {
    setMapTarget({ lat, lng, zoom, label });
    setActiveTab('map');
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="sticky top-0 z-40 bg-white shadow-sm">
        <div className="max-w-2xl mx-auto">
          <TabNav activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
      </div>
      <main className="max-w-2xl mx-auto px-4 pb-8">
        {activeTab === 'itinerary' && <ItineraryView onShowOnMap={handleShowOnMap} />}
        {activeTab === 'map' && (
          <MapView
            mapTarget={mapTarget}
            onMapTargetConsumed={() => setMapTarget(null)}
          />
        )}
        {activeTab === 'packing' && <PackingView />}
        {activeTab === 'vote' && <VoteView />}
      </main>
    </div>
  );
}
