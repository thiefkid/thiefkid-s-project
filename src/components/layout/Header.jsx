import { TRIP_META } from '../../data/tripData.js';
import { format, parseISO, differenceInDays } from 'date-fns';

export default function Header() {
  const start = parseISO(TRIP_META.startDate);
  const end = parseISO(TRIP_META.endDate);
  const today = new Date();
  const daysUntil = differenceInDays(start, today);
  const totalDays = differenceInDays(end, start) + 1;

  let countdown = null;
  if (daysUntil > 0) {
    countdown = `${daysUntil} days to go`;
  } else if (daysUntil === 0) {
    countdown = 'Trip starts today!';
  } else {
    const daysSince = Math.abs(daysUntil);
    if (daysSince <= totalDays) {
      countdown = `Day ${daysSince + 1} of ${totalDays}`;
    } else {
      countdown = 'Trip complete';
    }
  }

  return (
    <div className="bg-gradient-to-r from-blue-600 via-teal-500 to-orange-500 text-white px-4 py-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold tracking-tight">{TRIP_META.title}</h1>
        <p className="text-blue-100 text-sm mt-1">
          {format(start, 'dd MMM')} – {format(end, 'dd MMM yyyy')} · {totalDays} days
        </p>
        {countdown && (
          <span className="inline-block mt-2 bg-white/20 text-white text-xs font-medium px-3 py-1 rounded-full">
            {countdown}
          </span>
        )}
      </div>
    </div>
  );
}
