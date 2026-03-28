import { useState } from 'react';
import { format, parseISO, isToday, isPast } from 'date-fns';
import { LOCATIONS } from '../../data/tripData.js';
import FlightSegment from './FlightSegment.jsx';
import HotelCard from './HotelCard.jsx';
import ActivityItem from './ActivityItem.jsx';

export default function DayCard({ day, dayNumber, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen);

  const location = LOCATIONS.find((l) => l.id === day.locationId);
  const borderColor = location?.color ?? '#94a3b8';

  const hasContent =
    day.flights.length > 0 || day.hotel || day.activities.length > 0;

  const date = parseISO(day.date);
  const isCurrentDay = isToday(date);
  const isPastDay = !isCurrentDay && isPast(date);

  return (
    <div
      className={`bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden transition-opacity ${
        isPastDay ? 'opacity-70' : ''
      }`}
      style={{ borderLeftWidth: 4, borderLeftColor: borderColor }}
    >
      {/* Header */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex-shrink-0 text-center">
            <div className="text-xs font-medium text-slate-400 uppercase">
              {format(date, 'EEE')}
            </div>
            <div className={`text-xl font-bold leading-none ${isCurrentDay ? 'text-blue-600' : 'text-slate-700'}`}>
              {format(date, 'd')}
            </div>
            <div className="text-xs text-slate-400">{format(date, 'MMM')}</div>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-medium text-white px-2 py-0.5 rounded-full"
                style={{ backgroundColor: borderColor }}>
                Day {dayNumber}
              </span>
              {isCurrentDay && (
                <span className="text-xs font-medium bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
                  Today
                </span>
              )}
            </div>
            <p className="text-sm font-semibold text-slate-800 mt-0.5 leading-tight">{day.label}</p>
          </div>
        </div>
        <span className="text-slate-400 ml-2 flex-shrink-0 text-lg">{open ? '▲' : '▼'}</span>
      </button>

      {/* Body */}
      {open && hasContent && (
        <div className="px-4 pb-3 border-t border-slate-100 divide-y divide-slate-100">
          {day.flights.map((f) => (
            <FlightSegment key={f.id} flight={f} />
          ))}
          {day.hotel && <HotelCard hotel={day.hotel} />}
          {day.activities.map((a) => (
            <ActivityItem key={a.id} activity={a} />
          ))}
        </div>
      )}
      {open && !hasContent && (
        <div className="px-4 pb-3 pt-2 border-t border-slate-100 text-xs text-slate-400 italic">
          No activities logged yet.
        </div>
      )}
    </div>
  );
}
