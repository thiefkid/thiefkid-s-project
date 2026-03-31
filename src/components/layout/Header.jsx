import { TRIP_META } from '../../data/tripData.js';
import { format, parseISO, differenceInDays } from 'date-fns';

const ROUTE = ['HKG', 'SYD', 'LST', 'HBT', 'MEL', 'HKG'];

export default function Header() {
  const start = parseISO(TRIP_META.startDate);
  const end = parseISO(TRIP_META.endDate);
  const today = new Date();
  const daysUntil = differenceInDays(start, today);
  const totalDays = differenceInDays(end, start) + 1;

  let countdownNum = null;
  let countdownLabel = null;
  if (daysUntil > 0) {
    countdownNum = daysUntil;
    countdownLabel = 'days until takeoff';
  } else if (daysUntil === 0) {
    countdownNum = '✈️';
    countdownLabel = 'Trip starts today!';
  } else {
    const daysSince = Math.abs(daysUntil);
    if (daysSince < totalDays) {
      countdownNum = daysSince + 1;
      countdownLabel = `of ${totalDays} — in progress`;
    } else {
      countdownNum = '🎉';
      countdownLabel = 'Trip complete';
    }
  }

  return (
    <div
      className="relative bg-gradient-to-br from-sky-900 via-teal-800 to-slate-800 text-white overflow-hidden"
      style={{
        paddingTop: 'env(safe-area-inset-top)',
        paddingLeft: 'env(safe-area-inset-left)',
        paddingRight: 'env(safe-area-inset-right)',
      }}
    >
      {/* Decorative background blobs */}
      <div className="absolute -top-10 -right-10 w-56 h-56 rounded-full bg-teal-400/10 blur-2xl" />
      <div className="absolute -bottom-8 -left-8 w-40 h-40 rounded-full bg-sky-400/15 blur-xl" />
      <div className="absolute top-0 left-1/2 w-72 h-72 -translate-x-1/2 rounded-full bg-white/5 blur-3xl" />

      <div className="relative max-w-2xl mx-auto px-4 pt-5 pb-5">
        {/* Route pills */}
        <div className="flex items-center gap-1 flex-wrap mb-3">
          {ROUTE.map((city, i) => (
            <span key={i} className="flex items-center gap-1">
              <span className="text-xs font-bold tracking-widest text-white/85 bg-white/10 border border-white/15 px-2 py-0.5 rounded-full">
                {city}
              </span>
              {i < ROUTE.length - 1 && (
                <span className="text-teal-300/50 text-xs leading-none">›</span>
              )}
            </span>
          ))}
        </div>

        {/* Title */}
        <h1 className="text-3xl font-black tracking-tight leading-none text-white">
          {TRIP_META.title}
        </h1>
        <p className="text-sky-200/80 text-sm mt-1.5 font-medium">
          {format(start, 'd MMM')} – {format(end, 'd MMM yyyy')} &middot; {totalDays} days
        </p>

        {/* Big countdown */}
        <div className="mt-4 flex items-baseline gap-3">
          <span className="text-5xl font-black tabular-nums leading-none text-white drop-shadow-sm">
            {countdownNum}
          </span>
          <span className="text-teal-200 font-semibold text-base leading-tight">
            {countdownLabel}
          </span>
        </div>

        {/* Build time */}
        <p className="mt-3 text-white/30 text-xs font-mono">
          Updated{' '}
          {new Date(__BUILD_TIME__).toLocaleString('en-AU', {
            timeZone: 'Asia/Hong_Kong',
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          })}{' '}
          HKT
        </p>
      </div>
    </div>
  );
}
