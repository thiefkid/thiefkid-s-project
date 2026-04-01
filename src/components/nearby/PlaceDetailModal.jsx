import { useEffect } from 'react';
import { getPlacePhotoUrl } from './placePhoto.js';

function formatDistance(meters) {
  if (meters < 1000) return `${Math.round(meters)}m`;
  return `${(meters / 1000).toFixed(1)}km`;
}

function StarRating({ rating }) {
  const full = Math.round(rating);
  return (
    <span className="text-sm font-medium text-amber-500">
      {'★'.repeat(full)}{'☆'.repeat(5 - full)}{' '}
      {rating.toFixed(1)}
    </span>
  );
}

export default function PlaceDetailModal({ place, onClose }) {
  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const photos = place.photos ?? [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl shadow-xl max-h-[85dvh] flex flex-col"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Photo carousel */}
        {photos.length > 0 && (
          <div className="flex-shrink-0 overflow-x-auto flex snap-x snap-mandatory rounded-t-2xl">
            {photos.map((photo, i) => (
              <img
                key={photo.name}
                src={getPlacePhotoUrl(photo.name, { maxWidth: 600, maxHeight: 400 })}
                alt={`${place.name} photo ${i + 1}`}
                className="w-full flex-shrink-0 snap-start object-cover h-56 sm:h-64"
                loading={i === 0 ? 'eager' : 'lazy'}
              />
            ))}
          </div>
        )}

        {/* No photo fallback */}
        {photos.length === 0 && (
          <div className="flex-shrink-0 h-32 bg-gradient-to-br from-slate-200 to-slate-300 rounded-t-2xl flex items-center justify-center">
            <span className="text-4xl opacity-40">📷</span>
          </div>
        )}

        {/* Header */}
        <div className="flex-shrink-0 flex items-start justify-between px-4 pt-4 pb-2">
          <h2 className="text-lg font-bold text-slate-800 leading-tight pr-2">{place.name}</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-xl leading-none p-1 flex-shrink-0"
          >
            ×
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto px-4 pb-4 space-y-3 flex-1 min-h-0">
          {/* Summary */}
          {place.summary && (
            <p className="text-sm text-slate-600 leading-relaxed">{place.summary}</p>
          )}

          {/* Info */}
          <div className="space-y-2">
            <div className="flex items-center gap-3 flex-wrap">
              <StarRating rating={place.rating} />
              <span className="text-xs text-slate-400">
                ({place.ratingCount.toLocaleString()} reviews)
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {formatDistance(place.distance)}
              </span>
            </div>

            {place.address && (
              <p className="text-xs text-slate-500 leading-relaxed">{place.address}</p>
            )}
          </div>

          {/* Maps link */}
          {place.googleMapsUrl && (
            <a
              href={place.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 active:bg-blue-200 text-blue-600 font-medium text-sm transition-colors"
            >
              📍 Open in Google Maps
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
