import { useState, useEffect, useCallback } from 'react';

const CACHE_KEY = 'nearby-cache';
const CACHE_MAX_AGE_MS = 15 * 60 * 1000; // 15 minutes
const CACHE_MAX_DRIFT_M = 500; // metres — reuse cache if user hasn't moved far
const SEARCH_RADIUS = 5000; // 5 km

const FIELD_MASK = [
  'places.displayName',
  'places.formattedAddress',
  'places.rating',
  'places.userRatingCount',
  'places.location',
  'places.googleMapsUri',
  'places.photos',
  'places.editorialSummary',
].join(',');

// ── Haversine distance (metres) ────────────────────────────────────────────
function haversineMeters(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ── Read / write cache ─────────────────────────────────────────────────────
function readCache(lat, lng) {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const cached = JSON.parse(raw);
    const age = Date.now() - cached.timestamp;
    if (age > CACHE_MAX_AGE_MS) return null;
    if (haversineMeters(lat, lng, cached.lat, cached.lng) > CACHE_MAX_DRIFT_M) return null;
    return cached;
  } catch {
    return null;
  }
}

function writeCache(lat, lng, restaurants, attractions) {
  try {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ lat, lng, timestamp: Date.now(), restaurants, attractions }),
    );
  } catch {
    // quota exceeded — silently ignore
  }
}

// ── Normalize a Places API result into a flat object ───────────────────────
function normalizePlaces(apiPlaces, userLat, userLng) {
  return (apiPlaces ?? [])
    .map((p) => ({
      name: p.displayName?.text ?? 'Unknown',
      address: p.formattedAddress ?? '',
      rating: p.rating ?? 0,
      ratingCount: p.userRatingCount ?? 0,
      lat: p.location?.latitude ?? 0,
      lng: p.location?.longitude ?? 0,
      googleMapsUrl: p.googleMapsUri ?? null,
      photos: p.photos ?? [],
      summary: p.editorialSummary?.text ?? null,
      distance: haversineMeters(
        userLat,
        userLng,
        p.location?.latitude ?? 0,
        p.location?.longitude ?? 0,
      ),
    }))
    .sort((a, b) => b.rating - a.rating);
}

// ── Fetch one category from Places API ─────────────────────────────────────
async function fetchCategory(apiKey, lat, lng, includedTypes) {
  const res = await fetch('https://places.googleapis.com/v1/places:searchNearby', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask': FIELD_MASK,
    },
    body: JSON.stringify({
      includedTypes,
      maxResultCount: 10,
      rankPreference: 'DISTANCE',
      locationRestriction: {
        circle: {
          center: { latitude: lat, longitude: lng },
          radius: SEARCH_RADIUS,
        },
      },
    }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error?.message ?? `Places API returned ${res.status}`);
  }
  const data = await res.json();
  return data.places ?? [];
}

// ── The hook ───────────────────────────────────────────────────────────────
export function useNearby() {
  const [status, setStatus] = useState('idle'); // idle | locating | fetching | done | error
  const [error, setError] = useState(null);
  const [coords, setCoords] = useState(null);
  const [restaurants, setRestaurants] = useState([]);
  const [attractions, setAttractions] = useState([]);
  const [trigger, setTrigger] = useState(0); // bump to re-run

  const refresh = useCallback(() => {
    try { localStorage.removeItem(CACHE_KEY); } catch { /* noop */ }
    setStatus('idle');
    setError(null);
    setRestaurants([]);
    setAttractions([]);
    setTrigger((n) => n + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      // ── 0. Pre-checks ────────────────────────────────────────────────
      const apiKey = import.meta.env.VITE_GOOGLE_PLACES_API_KEY;
      if (!apiKey) {
        setStatus('error');
        setError('Google Places API key not configured. Add VITE_GOOGLE_PLACES_API_KEY to .env.local.');
        return;
      }

      if (!navigator.geolocation) {
        setStatus('error');
        setError('Geolocation is not supported by your browser.');
        return;
      }

      // ── 1. Get position ──────────────────────────────────────────────
      setStatus('locating');

      let lat, lng;
      try {
        const pos = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
          });
        });
        lat = pos.coords.latitude;
        lng = pos.coords.longitude;
      } catch (err) {
        if (cancelled) return;
        const messages = {
          1: 'Location permission denied. Please enable location access in your browser settings.',
          2: 'Unable to determine your location.',
          3: 'Location request timed out. Please try again.',
        };
        setStatus('error');
        setError(messages[err.code] ?? 'Could not get your location.');
        return;
      }

      if (cancelled) return;
      setCoords({ lat, lng });

      // ── 2. Check cache ───────────────────────────────────────────────
      const cached = readCache(lat, lng);
      if (cached) {
        setRestaurants(cached.restaurants);
        setAttractions(cached.attractions);
        setStatus('done');
        return;
      }

      // ── 3. Fetch from Places API ─────────────────────────────────────
      setStatus('fetching');

      try {
        const [rawRestaurants, rawAttractions] = await Promise.all([
          fetchCategory(apiKey, lat, lng, ['restaurant']),
          fetchCategory(apiKey, lat, lng, ['tourist_attraction', 'park', 'night_club', 'live_music_venue', 'museum', 'art_gallery']),
        ]);

        if (cancelled) return;

        const normR = normalizePlaces(rawRestaurants, lat, lng);
        const normA = normalizePlaces(rawAttractions, lat, lng);

        setRestaurants(normR);
        setAttractions(normA);
        writeCache(lat, lng, normR, normA);
        setStatus('done');
      } catch (err) {
        if (cancelled) return;
        setStatus('error');
        setError(err.message || 'Failed to fetch nearby places. Check your connection.');
      }
    }

    run();
    return () => { cancelled = true; };
  }, [trigger]);

  return { status, error, coords, restaurants, attractions, refresh };
}
