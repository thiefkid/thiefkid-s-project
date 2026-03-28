import { useRef } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, Marker } from 'react-leaflet';
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

export default function MapView() {
  const mapRef = useRef(null);

  return (
    <div className="pt-4">
      {/* City quick-jump buttons */}
      <div className="flex flex-wrap gap-2 mb-3">
        {LOCATIONS.map((loc) => (
          <button
            key={loc.id}
            onClick={() => mapRef.current?.flyTo([loc.lat, loc.lng], 10, { duration: 1.2 })}
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
          ref={mapRef}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />

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
                  <div style={{ color: '#64748b', fontSize: 11 }}>{act.dayLabel}</div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
