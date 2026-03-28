import { format, parseISO, differenceInDays } from 'date-fns';

export default function HotelCard({ hotel, isCheckIn, onShowOnMap, lat, lng }) {
  const nights = differenceInDays(parseISO(hotel.checkOut), parseISO(hotel.checkIn));
  const hasLocation = lat && lng;

  const mapButton = hasLocation ? (
    <button
      onClick={() => onShowOnMap({ lat, lng, zoom: 13, label: hotel.name })}
      title="Show on map"
      className="flex items-center gap-1 flex-shrink-0 text-blue-500 hover:text-blue-700 active:text-blue-800 transition-colors px-2 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 active:bg-blue-200 text-xs font-medium"
    >
      📍 Map
    </button>
  ) : null;

  if (!isCheckIn) {
    return (
      <div className="flex items-center justify-between gap-3 py-2">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center flex-shrink-0">
            <span className="text-base">🌙</span>
          </div>
          <div>
            <span className="text-sm text-slate-600">
              Staying at <span className="font-medium text-slate-800">{hotel.name}</span>
            </span>
            <p className="text-xs text-slate-400">{hotel.address}</p>
          </div>
        </div>
        {mapButton}
      </div>
    );
  }

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
                Check-in {format(parseISO(hotel.checkIn), 'dd MMM')}
                {' · '}
                {nights} night{nights !== 1 ? 's' : ''}
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
          {mapButton}
        </div>
      </div>
    </div>
  );
}
