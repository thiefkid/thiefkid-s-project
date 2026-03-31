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
    /*
     * h-[100dvh]: with viewport-fit=cover this equals the full screen in
     * standalone PWA mode and the content area above Safari toolbar in
     * browser mode — no JS height needed.
     */
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

      {/*
       * Tab bar wrapper.
       * padding-bottom: env(safe-area-inset-bottom, 0px) works correctly in
       * both modes without any JS detection:
       *   Browser mode  → 0px  (viewport sits above Safari toolbar; nothing unsafe below)
       *   Standalone PWA → ~34px (home indicator; content must not render there)
       */}
      <div
        data-testid="tab-bar-wrapper"
        data-bottom-pad="env-safe-area"
        className="flex-shrink-0 grow-0 bg-white border-t border-slate-100 overflow-hidden"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <div className="max-w-2xl mx-auto">
          <TabNav activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
      </div>

    </div>
  );
}
