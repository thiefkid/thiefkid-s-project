/**
 * Build a Google Places photo URL.
 * @param {string} photoName - e.g. "places/abc123/photos/xyz789"
 * @param {{ maxWidth?: number, maxHeight?: number }} options
 * @returns {string}
 */
export function getPlacePhotoUrl(photoName, { maxWidth = 400, maxHeight = 400 } = {}) {
  const apiKey = import.meta.env.VITE_GOOGLE_PLACES_API_KEY;
  return `https://places.googleapis.com/v1/${photoName}/media?maxHeightPx=${maxHeight}&maxWidthPx=${maxWidth}&key=${apiKey}`;
}
