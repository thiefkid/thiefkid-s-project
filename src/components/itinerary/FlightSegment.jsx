import { format, parseISO } from 'date-fns';

function formatTime(isoStr) {
  if (!isoStr) return null;
  return format(parseISO(isoStr), 'HH:mm');
}

export default function FlightSegment({ flight }) {
  const isTransfer = flight.type === 'transfer';

  return (
    <div className="flex items-start gap-3 py-2">
      <div className="mt-0.5 w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center flex-shrink-0">
        <span className="text-base">{isTransfer ? '🚗' : '✈️'}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-sm text-slate-800">
            {flight.from?.code || flight.from?.name}
            {' → '}
            {flight.to?.code || flight.to?.name}
          </span>
          {flight.departureTime && (
            <span className="text-xs text-slate-500">
              {formatTime(flight.departureTime)}
              {flight.arrivalTime ? ` – ${formatTime(flight.arrivalTime)}` : ''}
            </span>
          )}
          {!flight.departureTime && flight.arrivalTime && (
            <span className="text-xs text-slate-500">
              Arrives {formatTime(flight.arrivalTime)}
            </span>
          )}
        </div>
        {flight.notes && (
          <p className="text-xs text-slate-500 mt-0.5">{flight.notes}</p>
        )}
        {flight.confirmationCode && (
          <span className="inline-block mt-1 font-mono text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
            {flight.confirmationCode}
          </span>
        )}
      </div>
    </div>
  );
}
