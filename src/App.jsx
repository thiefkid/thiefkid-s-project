import { useState, useEffect } from 'react';
import Header from './components/layout/Header.jsx';
import TabNav from './components/layout/TabNav.jsx';
import ItineraryView from './components/itinerary/ItineraryView.jsx';
import MapView from './components/map/MapView.jsx';
import PackingView from './components/packing/PackingView.jsx';
import VoteView from './components/vote/VoteView.jsx';
import { useStandaloneMode } from './hooks/useStandaloneMode.js';

export default function App() {
  const [activeTab, setActiveTab] = useState('itinerary');
  const [mapTarget, setMapTarget] = useState(null);

  // Use actual window.innerHeight to avoid iOS phantom-toolbar space in 100dvh
  const [appHeight, setAppHeight] = useState(() => window.innerHeight);
  useEffect(() => {
    const update = () => setAppHeight(window.innerHeight);
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  // True standalone = launched from Home Screen (iOS navigator.standalone OR display-mode: standalone)
  // In standalone: we own the full screen, must pad for home indicator ourselves
  // In browser: Safari positions content above its own chrome — no extra padding needed from us
  const isStandalone = useStandaloneMode();
  const tabBarBottomPad = isStandalone ? 'env(safe-area-inset-bottom, 0px)' : '0px';

  const handleShowOnMap = ({ lat, lng, zoom = 15, label }) => {
    setMapTarget({ lat, lng, zoom, label });
    setActiveTab('map');
  };

  return (
    <div
      className="flex flex-col bg-white overflow-hidden"
      style={{ height: `${appHeight}px` }}
    >
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

      {/* ── Fixed bottom tab bar ── */}
      <div
        data-testid="tab-bar-wrapper"
        data-standalone={isStandalone ? 'true' : 'false'}
        className="flex-shrink-0 grow-0 bg-white border-t border-slate-100 overflow-hidden"
        style={{ paddingBottom: tabBarBottomPad }}
      >
        <div className="max-w-2xl mx-auto">
          <TabNav activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
      </div>
    </div>
  );
}
