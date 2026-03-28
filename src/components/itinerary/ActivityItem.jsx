import { format, parseISO } from 'date-fns';

const TYPE_META = {
  tour:      { emoji: '🎟️', bg: 'bg-orange-100' },
  activity:  { emoji: '🥾', bg: 'bg-green-100' },
  food:      { emoji: '🍽️', bg: 'bg-pink-100' },
  transport: { emoji: '🚗', bg: 'bg-slate-100' },
  free:      { emoji: '☀️', bg: 'bg-yellow-100' },
};

export default function ActivityItem({ activity }) {
  const meta = TYPE_META[activity.type] || TYPE_META.free;

  return (
    <div className="flex items-start gap-3 py-2">
      <div className={`mt-0.5 w-8 h-8 rounded-full ${meta.bg} flex items-center justify-center flex-shrink-0`}>
        <span className="text-base">{meta.emoji}</span>
      </div>
      <div className="flex-1 min-w-0">
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
        {activity.notes && (
          <p className="text-xs text-slate-500 mt-0.5 whitespace-pre-line">{activity.notes}</p>
        )}
        {activity.bookingRef && (
          <span className="inline-block mt-1 font-mono text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
            {activity.bookingRef}
          </span>
        )}
      </div>
    </div>
  );
}
