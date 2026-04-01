import { TRIP_META } from '../../data/tripData.js';
import { format, parseISO, differenceInDays } from 'date-fns';

const ROUTE = ['HKG', 'SYD', 'LST', 'HBT', 'MEL', 'HKG'];

// Map route codes to DAYS locationIds for scroll-to-day navigation
const CODE_TO_LOCATION = {
  SYD: 'syd',
  LST: 'lst',
  HBT: 'hbt',
  MEL: 'mel',
};

export default function Header({ onLocationClick }) {
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

      <div className="relative max-w-2xl mx-auto px-4 pt-3 pb-3">
        {/* Route pills */}
        <div className="flex items-center gap-1 flex-wrap mb-2">
          {ROUTE.map((city, i) => {
            const locId = CODE_TO_LOCATION[city];
            const isClickable = locId && onLocationClick;
            return (
              <span key={i} className="flex items-center gap-1">
                {isClickable ? (
                  <button
                    onClick={() => onLocationClick(locId)}
                    className="text-[11px] font-bold tracking-widest text-white/85 bg-white/10 border border-white/15 px-1.5 py-0.5 rounded-full hover:bg-white/25 active:scale-95 transition-all"
                  >
                    {city}
                  </button>
                ) : (
                  <span className="text-[11px] font-bold tracking-widest text-white/60 bg-white/5 border border-white/10 px-1.5 py-0.5 rounded-full">
                    {city}
                  </span>
                )}
                {i < ROUTE.length - 1 && (
                  <span className="text-teal-300/50 text-xs leading-none">›</span>
                )}
              </span>
            );
          })}
        </div>

        {/* Title + date on one line */}
        <div className="flex items-baseline gap-2 flex-wrap">
          <h1 className="text-2xl font-black tracking-tight leading-none text-white">
            {TRIP_META.title}
          </h1>
          <p className="text-sky-200/70 text-xs font-medium">
            {format(start, 'd MMM')} – {format(end, 'd MMM yyyy')}
          </p>
        </div>

        {/* Compact countdown */}
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-4xl font-black tabular-nums leading-none text-white drop-shadow-sm">
            {countdownNum}
          </span>
          <span className="text-teal-200 font-semibold text-sm leading-tight">
            {countdownLabel}
          </span>
        </div>

        {/* Build time */}
        <p className="mt-1.5 text-white/30 text-[10px] font-mono">
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
