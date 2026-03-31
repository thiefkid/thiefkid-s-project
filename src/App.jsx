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
    // h-[100dvh]: dynamic viewport height — respects iOS browser chrome appearing/disappearing
    <div className="h-[100dvh] flex flex-col bg-white overflow-hidden">

      {/* ── Fixed header at top ── */}
      <div className="flex-shrink-0">
        <Header />
      </div>

      {/* ── Scrollable content area ── */}
      <main className="flex-1 overflow-y-auto overscroll-contain min-h-0">
        {activeTab === 'itinerary' && (
          <div className="max-w-2xl mx-auto px-4 pb-4">
            <ItineraryView onShowOnMap={handleShowOnMap} />
          </div>
        )}
        {activeTab === 'map' && (
          <MapView
            mapTarget={mapTarget}
            onMapTargetConsumed={() => setMapTarget(null)}
          />
        )}
        {activeTab === 'packing' && (
          <div className="max-w-2xl mx-auto px-4 pb-4">
            <PackingView />
          </div>
        )}
        {activeTab === 'vote' && (
          <div className="max-w-2xl mx-auto px-4 pb-4">
            <VoteView />
          </div>
        )}
      </main>

      {/* ── Fixed bottom tab bar with safe area for iPhone home indicator ── */}
      <div
        className="flex-shrink-0 bg-white border-t border-slate-100"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <div className="max-w-2xl mx-auto">
          <TabNav activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
      </div>

    </div>
  );
}
