import { useState } from 'react';
import { useNearby } from '../../hooks/useNearby.js';
import { getPlacePhotoUrl } from './placePhoto.js';
import PlaceDetailModal from './PlaceDetailModal.jsx';

function formatDistance(meters) {
  if (meters < 1000) return `${Math.round(meters)}m`;
  return `${(meters / 1000).toFixed(1)}km`;
}

function StarRating({ rating }) {
  const full = Math.round(rating);
  return (
    <span className="text-xs font-medium text-amber-300">
      {'★'.repeat(full)}{'☆'.repeat(5 - full)}{' '}
      <span className="text-white/90">{rating.toFixed(1)}</span>
    </span>
  );
}

function PlaceCard({ place, onSelect }) {
  const photo = place.photos?.[0];
  const hasPhoto = !!photo;

  return (
    <button
      type="button"
      onClick={() => onSelect(place)}
      className="relative overflow-hidden rounded-xl h-48 w-full text-left cursor-pointer group focus:outline-none focus:ring-2 focus:ring-blue-400"
    >
      {/* Background image */}
      {hasPhoto ? (
        <img
          src={getPlacePhotoUrl(photo.name, { maxWidth: 400, maxHeight: 400 })}
          alt={place.name}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-slate-300 to-slate-400" />
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent" />

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-3.5">
        <h3 className="font-semibold text-sm text-white leading-tight drop-shadow-sm">
          {place.name}
        </h3>
        {place.summary && (
          <p className="text-xs text-white/75 mt-0.5 line-clamp-1">{place.summary}</p>
        )}
        <div className="flex items-center gap-3 mt-1.5 flex-wrap">
          <StarRating rating={place.rating} />
          <span className="text-xs text-white/60">
            ({place.ratingCount.toLocaleString()})
          </span>
          <span className="text-xs text-white/80 font-medium">
            {formatDistance(place.distance)}
          </span>
        </div>
      </div>
    </button>
  );
}

function Spinner({ label }) {
  return (
    <div className="pt-12 flex flex-col items-center gap-3 text-slate-400">
      <div className="w-8 h-8 border-2 border-slate-200 border-t-blue-400 rounded-full animate-spin" />
      <p className="text-sm">{label}</p>
    </div>
  );
}

export default function NearbyView() {
  const { status, error, restaurants, attractions, refresh } = useNearby();
  const [selectedPlace, setSelectedPlace] = useState(null);

  if (status === 'idle' || status === 'locating') {
    return <Spinner label="Getting your location…" />;
  }

  if (status === 'fetching') {
    return <Spinner label="Finding nearby places…" />;
  }

  if (status === 'error') {
    return (
      <div className="pt-8">
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
          <p className="text-sm text-red-600">{error}</p>
          <button
            onClick={refresh}
            className="mt-3 px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const hasResults = restaurants.length > 0 || attractions.length > 0;

  return (
    <div className="pt-4 pb-6">
      <p className="text-xs text-slate-400 mb-4">
        Showing top-rated places within 5 km of your current location.
      </p>

      {!hasResults && (
        <div className="text-center py-8">
          <p className="text-sm text-slate-500">No places found within 5 km. Try moving to a different area.</p>
          <button
            onClick={refresh}
            className="mt-3 text-sm text-blue-500 hover:text-blue-700 font-medium"
          >
            Refresh
          </button>
        </div>
      )}

      {restaurants.length > 0 && (
        <section>
          <h2 className="text-base font-bold text-slate-800 mb-3 flex items-center gap-2">
            <span>🍽️</span> Top Restaurants
          </h2>
          <div className="space-y-3">
            {restaurants.map((place, i) => (
              <PlaceCard key={`r-${i}-${place.name}`} place={place} onSelect={setSelectedPlace} />
            ))}
          </div>
        </section>
      )}

      {attractions.length > 0 && (
        <section className={restaurants.length > 0 ? 'mt-6' : ''}>
          <h2 className="text-base font-bold text-slate-800 mb-3 flex items-center gap-2">
            <span>🎯</span> Things to Do
          </h2>
          <div className="space-y-3">
            {attractions.map((place, i) => (
              <PlaceCard key={`a-${i}-${place.name}`} place={place} onSelect={setSelectedPlace} />
            ))}
          </div>
        </section>
      )}

      {hasResults && (
        <div className="mt-6 text-center">
          <button
            onClick={refresh}
            className="text-xs text-slate-400 hover:text-blue-500 font-medium transition-colors"
          >
            Results cached · Tap to refresh
          </button>
        </div>
      )}

      {selectedPlace && (
        <PlaceDetailModal
          place={selectedPlace}
          onClose={() => setSelectedPlace(null)}
        />
      )}
    </div>
  );
}
