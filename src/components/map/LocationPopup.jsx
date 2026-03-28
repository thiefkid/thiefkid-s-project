import { DAYS } from '../../data/tripData.js';

export default function LocationPopup({ location }) {
  const days = DAYS.filter((d) => d.locationId === location.id);
  const hotels = days
    .filter((d) => d.hotel)
    .map((d) => d.hotel)
    .filter((h, i, arr) => arr.findIndex((x) => x.id === h.id) === i);
  const activities = days.flatMap((d) => d.activities).filter((a) => a.name);

  return (
    <div style={{ minWidth: 180, maxWidth: 260, fontSize: 13 }}>
      <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6, color: location.color }}>
        {location.name}
      </div>
      {days.length > 0 && (
        <div style={{ color: '#64748b', marginBottom: 6 }}>
          {days.length} day{days.length !== 1 ? 's' : ''} here
        </div>
      )}
      {hotels.length > 0 && (
        <div style={{ marginBottom: 6 }}>
          {hotels.map((h) => (
            <div key={h.id} style={{ display: 'flex', gap: 4, alignItems: 'flex-start', marginBottom: 2 }}>
              <span>🏠</span>
              <span style={{ color: '#334155' }}>{h.name}</span>
            </div>
          ))}
        </div>
      )}
      {activities.slice(0, 5).map((a) => (
        <div key={a.id} style={{ display: 'flex', gap: 4, alignItems: 'flex-start', marginBottom: 2, color: '#475569' }}>
          <span>·</span>
          <span>{a.name}</span>
        </div>
      ))}
      {activities.length > 5 && (
        <div style={{ color: '#94a3b8', fontSize: 11 }}>+{activities.length - 5} more</div>
      )}
    </div>
  );
}
