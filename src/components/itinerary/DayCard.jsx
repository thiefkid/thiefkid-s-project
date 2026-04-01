import { useState, useEffect } from 'react';
import { format, parseISO, isToday, isPast } from 'date-fns';
import { LOCATIONS } from '../../data/tripData.js';
import FlightSegment from './FlightSegment.jsx';
import HotelCard from './HotelCard.jsx';
import ActivityItem from './ActivityItem.jsx';
import AddEditActivityModal from './AddEditActivityModal.jsx';

function getAccommodationForDate(accommodations, dateStr) {
  return (accommodations ?? []).find(
    (a) => a.checkIn <= dateStr && dateStr < a.checkOut,
  ) ?? null;
}

export default function DayCard({
  day,
  dayNumber,
  defaultOpen,
  forceOpen,
  accommodations,
  weather,
  onShowOnMap,
  onAddActivity,
  onDeleteActivity,
  onUpdateActivity,
}) {
  const [open, setOpen] = useState(defaultOpen);
  const [modal, setModal] = useState(null); // null | { mode: 'add' } | { mode: 'edit', activity }

  useEffect(() => {
    if (forceOpen) setOpen(true);
  }, [forceOpen]);

  const location = LOCATIONS.find((l) => l.id === day.locationId);
  const borderColor = location?.color ?? '#94a3b8';

  const date = parseISO(day.date);
  const isCurrentDay = isToday(date);
  const isPastDay = !isCurrentDay && isPast(date);

  const accommodation = getAccommodationForDate(accommodations, day.date);
  const isCheckIn = accommodation?.checkIn === day.date;

  const hasContent = day.flights.length > 0 || day.activities.length > 0 || accommodation;

  async function handleSave(activity) {
    if (modal?.mode === 'edit') {
      await onUpdateActivity(modal.activity, activity);
    } else {
      await onAddActivity(activity);
    }
  }

  return (
    <>
      <div
        data-location-id={day.locationId}
        className={`bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden transition-opacity ${
          isPastDay ? 'opacity-60' : ''
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
                <span
                  className="text-xs font-medium text-white px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: borderColor }}
                >
                  Day {dayNumber}
                </span>
                {isCurrentDay && (
                  <span className="text-xs font-bold bg-rose-100 text-rose-600 px-2 py-0.5 rounded-full">
                    Today
                  </span>
                )}
              </div>
              <p className="text-sm font-bold text-slate-800 mt-0.5 leading-tight">{day.label}</p>
              {weather && (
                <span className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                  <span>{weather.emoji}</span>
                  <span>{weather.fake ? '~' : ''}{weather.max}°/{weather.min}°</span>
                  {weather.precip > 0 && <span>· {weather.precip.toFixed(1)}mm</span>}
                  {weather.fake && <span className="text-slate-400 italic">(est.)</span>}
                </span>
              )}
            </div>
          </div>
          <span className="text-slate-400 ml-2 flex-shrink-0 text-lg">{open ? '▲' : '▼'}</span>
        </button>

        {/* Body */}
        {open && (
          <div className="px-4 pb-3 border-t border-slate-100 divide-y divide-slate-100">
            {day.flights.map((f) => (
              <FlightSegment key={f.id} flight={f} />
            ))}

            {day.activities.map((a) => (
              <ActivityItem
                key={a.id}
                activity={a}
                onShowOnMap={onShowOnMap}
                onEdit={() => setModal({ mode: 'edit', activity: a })}
                onDelete={() => onDeleteActivity(a)}
              />
            ))}

            {!hasContent && (
              <p className="py-2 text-xs text-slate-400 italic">No activities logged yet.</p>
            )}

            {accommodation && (
              <HotelCard
                hotel={accommodation}
                isCheckIn={isCheckIn}
                onShowOnMap={onShowOnMap}
                lat={accommodation.lat}
                lng={accommodation.lng}
              />
            )}

            {/* Add activity button */}
            <div className="pt-3">
              <button
                onClick={() => setModal({ mode: 'add' })}
                className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg border border-dashed border-slate-300 text-xs font-medium text-slate-500 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50 transition-colors"
              >
                ＋ Add activity
              </button>
            </div>
          </div>
        )}
      </div>

      {modal && (
        <AddEditActivityModal
          existing={modal.mode === 'edit' ? modal.activity : null}
          dayDate={day.date}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}
    </>
  );
}
