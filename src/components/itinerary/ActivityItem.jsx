import { format, parseISO } from 'date-fns';

const TYPE_META = {
  tour:      { emoji: '🎟️', bg: 'bg-orange-100' },
  activity:  { emoji: '🥾', bg: 'bg-green-100' },
  food:      { emoji: '🍽️', bg: 'bg-pink-100' },
  transport: { emoji: '🚗', bg: 'bg-slate-100' },
  free:      { emoji: '☀️', bg: 'bg-yellow-100' },
};

export default function ActivityItem({ activity, onShowOnMap, onEdit, onDelete }) {
  const meta = TYPE_META[activity.type] || TYPE_META.free;
  const hasLocation = activity.lat && activity.lng;

  return (
    <div className="flex items-start gap-3 py-2">
      <div className={`mt-0.5 w-8 h-8 rounded-full ${meta.bg} flex items-center justify-center flex-shrink-0`}>
        <span className="text-base">{meta.emoji}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-sm text-slate-800">{activity.name}</span>
              {activity.time && (
                <span className="text-xs text-slate-500">
                  {format(parseISO(activity.time), 'HH:mm')}
                </span>
              )}
              {activity.duration && (
                <span className="text-xs text-slate-400">{activity.duration}</span>
              )}
            </div>
            {activity.address && (
              <p className="text-xs text-slate-400 mt-0.5 font-mono">{activity.address}</p>
            )}
            {activity.notes && (
              <p className="text-xs text-slate-500 mt-0.5 whitespace-pre-line">{activity.notes}</p>
            )}
            {activity.bookingRef && (
              <span className="inline-block mt-1 font-mono text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                {activity.bookingRef}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 flex-shrink-0 mt-0.5">
            {hasLocation && (
              <button
                onClick={() => onShowOnMap({ lat: activity.lat, lng: activity.lng, zoom: 15, label: activity.name })}
                title="Show on map"
                className="flex items-center gap-1 text-blue-500 hover:text-blue-700 active:text-blue-800 transition-colors px-2 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 active:bg-blue-200 text-xs font-medium"
              >
                📍 Map
              </button>
            )}
            {onEdit && (
              <button
                onClick={onEdit}
                title="Edit activity"
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors text-sm"
              >
                ✏️
              </button>
            )}
            {onDelete && (
              <button
                onClick={onDelete}
                title="Delete activity"
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors text-sm"
              >
                🗑
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
