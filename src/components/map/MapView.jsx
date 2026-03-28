import { useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import { LOCATIONS, DAYS } from '../../data/tripData.js';
import LocationPopup from './LocationPopup.jsx';

// Fix Leaflet default marker icon paths (broken with Vite bundling)
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Gather all activities that have lat/lng
const activityMarkers = DAYS.flatMap((d) =>
  d.activities
    .filter((a) => a.lat && a.lng)
    .map((a) => ({ ...a, dayLabel: d.label }))
);

// Must be rendered inside MapContainer so useMap() has access to the map instance
function FlyToTarget({ mapTarget, onConsumed }) {
  const map = useMap();
  useEffect(() => {
    if (mapTarget) {
      map.flyTo([mapTarget.lat, mapTarget.lng], mapTarget.zoom, { duration: 1.2 });
      onConsumed();
    }
  }, [mapTarget]);
  return null;
}

export default function MapView({ mapTarget, onMapTargetConsumed }) {
  return (
    <div className="pt-4">
      {/* City quick-jump buttons */}
      <div className="flex flex-wrap gap-2 mb-3">
        {LOCATIONS.map((loc) => (
          <button
            key={loc.id}
            id={`map-btn-${loc.id}`}
            className="text-xs font-medium px-3 py-1 rounded-full text-white transition-opacity hover:opacity-80"
            style={{ backgroundColor: loc.color }}
          >
            {loc.name}
          </button>
        ))}
      </div>

      <div className="rounded-xl overflow-hidden shadow-sm border border-slate-200"
           style={{ height: 'calc(100vh - 260px)', minHeight: 400 }}>
        <MapContainer
          center={[-40.5, 147.0]}
          zoom={6}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />

          {/* Fly to location when triggered from itinerary */}
          <FlyToTarget mapTarget={mapTarget} onConsumed={onMapTargetConsumed} />

          {/* City quick-jump handler — wires buttons outside MapContainer to flyTo */}
          <CityButtons />

          {/* City pins */}
          {LOCATIONS.map((loc) => (
            <CircleMarker
              key={loc.id}
              center={[loc.lat, loc.lng]}
              radius={16}
              pathOptions={{
                color: loc.color,
                fillColor: loc.color,
                fillOpacity: 0.85,
                weight: 2,
              }}
            >
              <Popup>
                <LocationPopup location={loc} />
              </Popup>
            </CircleMarker>
          ))}

          {/* Activity markers */}
          {activityMarkers.map((act) => (
            <Marker key={act.id} position={[act.lat, act.lng]}>
              <Popup>
                <div style={{ fontSize: 13 }}>
                  <div style={{ fontWeight: 600, marginBottom: 2 }}>{act.name}</div>
                  <div style={{ color: '#64748b', fontSize: 11, marginBottom: 6 }}>{act.dayLabel}</div>
                  <a
                    href={`https://www.google.com/maps?q=${act.lat},${act.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#3b82f6', fontSize: 12 }}
                  >
                    📍 Open in Google Maps
                  </a>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}

// Wires the city buttons (rendered outside MapContainer) to flyTo via DOM events
function CityButtons() {
  const map = useMap();
  useEffect(() => {
    LOCATIONS.forEach((loc) => {
      const btn = document.getElementById(`map-btn-${loc.id}`);
      if (btn) {
        btn.onclick = () => map.flyTo([loc.lat, loc.lng], 10, { duration: 1.2 });
      }
    });
  }, [map]);
  return null;
}
