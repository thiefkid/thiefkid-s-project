import { format, parseISO } from 'date-fns';

export default function HotelCard({ hotel }) {
  const googleMapsUrl = `https://maps.google.com/?q=${encodeURIComponent(hotel.address)}`;

  return (
    <div className="flex items-start gap-3 py-2">
      <div className="mt-0.5 w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
        <span className="text-base">🏠</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-sm text-slate-800">{hotel.name}</span>
              <span className="text-xs text-slate-500">
                {format(parseISO(hotel.checkIn), 'dd MMM')}
                {hotel.checkOut !== hotel.checkIn
                  ? ` – ${format(parseISO(hotel.checkOut), 'dd MMM')}`
                  : ''}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{hotel.address}</p>
            {hotel.notes && (
              <p className="text-xs text-slate-500 mt-0.5">{hotel.notes}</p>
            )}
            {hotel.confirmationCode && (
              <span className="inline-block mt-1 font-mono text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                {hotel.confirmationCode}
              </span>
            )}
          </div>
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Open in Google Maps"
            className="flex items-center gap-1 flex-shrink-0 mt-0.5 text-blue-500 hover:text-blue-700 transition-colors"
          >
            <span>📍</span>
            <span className="text-xs whitespace-nowrap">Maps</span>
          </a>
        </div>
      </div>
    </div>
  );
}
