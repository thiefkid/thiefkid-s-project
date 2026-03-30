import { useState, useEffect } from 'react';
import { LOCATIONS } from '../data/tripData.js';

const WMO_EMOJIS = [
  [0,  '☀️'],
  [3,  '⛅'],
  [48, '🌫️'],
  [55, '🌦️'],
  [67, '🌧️'],
  [77, '❄️'],
  [82, '🌧️'],
  [99, '⛈️'],
];
function wmoEmoji(code) {
  for (const [max, emoji] of WMO_EMOJIS) if (code <= max) return emoji;
  return '🌤️';
}

// Seasonal baselines for May (autumn) in southern Australia
const SEASONAL = {
  syd: { minBase: 16, maxBase: 23 },
  lst: { minBase: 7,  maxBase: 13 },
  swn: { minBase: 8,  maxBase: 14 },
  hbt: { minBase: 8,  maxBase: 13 },
  mel: { minBase: 12, maxBase: 18 },
};

// Deterministic fake weather — same values every page load for a given date+location
function fakeWeather(date, locId) {
  let seed = [...(date + locId)].reduce((s, c) => (s * 31 + c.charCodeAt(0)) | 0, 0);
  const rand = () => { seed = (seed * 1664525 + 1013904223) | 0; return Math.abs(seed) / 2147483648; };
  const s = SEASONAL[locId] ?? { minBase: 12, maxBase: 20 };
  const min = s.minBase + Math.floor(rand() * 4);
  const max = s.maxBase + Math.floor(rand() * 4);
  const CODES = [0, 1, 2, 3, 61, 80, 95];
  const code = CODES[Math.floor(rand() * CODES.length)];
  const precip = code >= 61 ? +(rand() * 5).toFixed(1) : 0;
  return { max, min, precip, emoji: wmoEmoji(code), fake: true };
}

export function useWeather(days) {
  const [weatherByDate, setWeatherByDate] = useState({});

  useEffect(() => {
    if (!days.length) return;

    // Group dates by locationId for batched API calls
    const byLocation = {};
    for (const day of days) {
      if (!byLocation[day.locationId]) byLocation[day.locationId] = [];
      byLocation[day.locationId].push(day.date);
    }

    const results = {};

    Promise.all(
      Object.entries(byLocation).map(async ([locId, dates]) => {
        const loc = LOCATIONS.find((l) => l.id === locId);
        if (!loc) return;
        const start = dates[0];
        const end = dates[dates.length - 1];
        try {
          const url = new URL('https://api.open-meteo.com/v1/forecast');
          url.searchParams.set('latitude', loc.lat);
          url.searchParams.set('longitude', loc.lng);
          url.searchParams.set('daily', 'temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode');
          url.searchParams.set('timezone', 'auto');
          url.searchParams.set('start_date', start);
          url.searchParams.set('end_date', end);

          const res = await fetch(url.toString());
          const data = await res.json();
          const { time, temperature_2m_max, temperature_2m_min, precipitation_sum, weathercode } = data.daily ?? {};
          const realDates = new Set(time ?? []);

          (time ?? []).forEach((date, i) => {
            results[date] = {
              max: Math.round(temperature_2m_max[i]),
              min: Math.round(temperature_2m_min[i]),
              precip: precipitation_sum[i] ?? 0,
              emoji: wmoEmoji(weathercode[i]),
              fake: false,
            };
          });

          // Any dates outside the forecast window → deterministic fake data
          for (const date of dates) {
            if (!realDates.has(date)) results[date] = fakeWeather(date, locId);
          }
        } catch {
          // API unreachable — all dates get fake data
          for (const date of dates) results[date] = fakeWeather(date, locId);
        }
      })
    ).then(() => setWeatherByDate({ ...results }));
  }, [days.length]);

  return weatherByDate;
}
