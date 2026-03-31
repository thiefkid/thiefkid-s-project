import { useState, useRef } from 'react';
import { format, parseISO } from 'date-fns';

const TYPE_META = {
  tour:      { emoji: '🎟️', bg: 'bg-orange-100' },
  activity:  { emoji: '🥾', bg: 'bg-green-100' },
  food:      { emoji: '🍽️', bg: 'bg-pink-100' },
  transport: { emoji: '🚗', bg: 'bg-slate-100' },
  free:      { emoji: '☀️', bg: 'bg-yellow-100' },
};

const SWIPE_REVEAL_WIDTH = 80; // px
const SWIPE_THRESHOLD    = 40; // px — snap open if dragged past this

export default function ActivityItem({ activity, onShowOnMap, onEdit, onDelete }) {
  const meta = TYPE_META[activity.type] || TYPE_META.free;
  const hasLocation = activity.lat && activity.lng;

  const [delta, setDelta]                 = useState(0);
  const [animated, setAnimated]           = useState(false);
  const [confirmPending, setConfirmPending] = useState(false);

  const startX     = useRef(0);
  const startY     = useRef(0);
  const startDelta = useRef(0);
  const axis       = useRef(null); // 'h' | 'v' | null

  function snapTo(target) {
    setAnimated(true);
    setDelta(target);
  }

  function handleTouchStart(e) {
    startX.current     = e.touches[0].clientX;
    startY.current     = e.touches[0].clientY;
    startDelta.current = delta;
    axis.current       = null;
    setAnimated(false);
  }

  function handleTouchMove(e) {
    const dx = e.touches[0].clientX - startX.current;
    const dy = e.touches[0].clientY - startY.current;

    // Lock axis on first significant movement
    if (axis.current === null) {
      if (Math.abs(dx) < 4 && Math.abs(dy) < 4) return;
      axis.current = Math.abs(dx) > Math.abs(dy) ? 'h' : 'v';
    }

    if (axis.current !== 'h') return;

    // Prevent page scroll while swiping horizontally
    e.preventDefault();

    const clamped = Math.min(0, Math.max(-SWIPE_REVEAL_WIDTH, startDelta.current + dx));
    setDelta(clamped);
  }

  function handleTouchEnd() {
    if (axis.current !== 'h') return;
    if (delta < -SWIPE_THRESHOLD) {
      snapTo(-SWIPE_REVEAL_WIDTH);
    } else {
      snapTo(0);
    }
    axis.current = null;
  }

  function handleContentClick() {
    if (delta !== 0) {
      snapTo(0);
    }
  }

  function handleDeletePress() {
    snapTo(0);
    setConfirmPending(true);
  }

  return (
    <>
      {/* Swipe container */}
      <div className="relative overflow-hidden">
        {/* Red delete button revealed behind content */}
        {onDelete && (
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={handleDeletePress}
            style={{ width: SWIPE_REVEAL_WIDTH }}
            className="absolute inset-y-0 right-0 flex items-center justify-center bg-red-500 text-white text-sm font-semibold"
          >
            Delete
          </button>
        )}

        {/* Sliding content */}
        <div
          style={{
            transform: `translateX(${delta}px)`,
            transition: animated ? 'transform 0.2s ease' : 'none',
          }}
          onTouchStart={onDelete ? handleTouchStart : undefined}
          onTouchMove={onDelete ? handleTouchMove : undefined}
          onTouchEnd={onDelete ? handleTouchEnd : undefined}
          onClick={delta !== 0 ? handleContentClick : undefined}
          className="flex items-start gap-3 py-2 bg-white"
        >
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
                    className="text-xs font-medium text-slate-500 hover:text-teal-600 px-2 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    Edit
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete confirmation dialog */}
      {confirmPending && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40"
          onClick={() => setConfirmPending(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl p-6 max-w-xs w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-4xl text-center mb-3">🗑️</div>
            <h2 className="text-base font-bold text-slate-800 text-center mb-1">Delete activity?</h2>
            <p className="text-sm text-slate-500 text-center mb-5">
              "{activity.name}" will be permanently removed.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmPending(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => { onDelete(); setConfirmPending(false); }}
                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
