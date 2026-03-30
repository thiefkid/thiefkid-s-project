import { parseISO, isPast, isToday } from 'date-fns';
import { useTripData } from '../../hooks/useTripData.js';
import { useTripMutations } from '../../hooks/useTripMutations.js';
import { useWeather } from '../../hooks/useWeather.js';
import DayCard from './DayCard.jsx';

const SYNC_BADGE = {
  loading: { dot: 'bg-slate-300', label: 'Syncing…' },
  ok:      { dot: 'bg-green-400', label: 'Synced' },
  error:   { dot: 'bg-red-400',   label: 'Offline' },
};

export default function ItineraryView({ onShowOnMap }) {
  const { days, accommodations, status } = useTripData();
  const { addActivity, deleteActivity, updateActivity } = useTripMutations();
  const weatherByDate = useWeather(days);
  const badge = SYNC_BADGE[status];

  if (status === 'loading' && days.length === 0) {
    return (
      <div className="pt-8 flex flex-col items-center gap-3 text-slate-400">
        <div className="w-8 h-8 border-2 border-slate-200 border-t-blue-400 rounded-full animate-spin" />
        <p className="text-sm">Loading itinerary…</p>
      </div>
    );
  }

  if (status === 'error' && days.length === 0) {
    return (
      <div className="pt-8 text-center text-sm text-red-500">
        Could not load itinerary. Check your connection and reload.
      </div>
    );
  }

  return (
    <div className="pt-4 space-y-3">
      {/* Sync status badge */}
      <div className="flex justify-end">
        <span className="flex items-center gap-1.5 text-xs text-slate-400">
          <span className={`w-2 h-2 rounded-full ${badge.dot}`} />
          {badge.label}
        </span>
      </div>

      {days.map((day, i) => {
        const date = parseISO(day.date);
        const isPastDay = !isToday(date) && isPast(date);
        const defaultOpen = !isPastDay;
        return (
          <DayCard
            key={day.id}
            day={day}
            dayNumber={i + 1}
            defaultOpen={defaultOpen}
            accommodations={accommodations}
            weather={weatherByDate[day.date]}
            onShowOnMap={onShowOnMap}
            onAddActivity={(activity) => addActivity(day.id, activity)}
            onDeleteActivity={(activity) => deleteActivity(day.id, activity)}
            onUpdateActivity={(oldActivity, newActivity) => updateActivity(day.id, oldActivity, newActivity)}
          />
        );
      })}
    </div>
  );
}
