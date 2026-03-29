import { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase.js';

/**
 * Subscribes to the 'days' and 'accommodations' Firestore collections.
 * Returns live-updating arrays sorted the same way as the original tripData.js.
 *
 * status: 'loading' | 'ok' | 'error'
 */
export function useTripData() {
  const [days, setDays] = useState([]);
  const [accommodations, setAccommodations] = useState([]);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    let daysOk = false;
    let accsOk = false;

    const unsubDays = onSnapshot(
      collection(db, 'days'),
      (snap) => {
        const sorted = snap.docs
          .map((d) => d.data())
          .sort((a, b) => (a.date < b.date ? -1 : 1));
        setDays(sorted);
        daysOk = true;
        if (daysOk && accsOk) setStatus('ok');
      },
      () => setStatus('error'),
    );

    const unsubAccs = onSnapshot(
      collection(db, 'accommodations'),
      (snap) => {
        const sorted = snap.docs
          .map((d) => d.data())
          .sort((a, b) => (a.checkIn < b.checkIn ? -1 : 1));
        setAccommodations(sorted);
        accsOk = true;
        if (daysOk && accsOk) setStatus('ok');
      },
      () => setStatus('error'),
    );

    return () => {
      unsubDays();
      unsubAccs();
    };
  }, []);

  return { days, accommodations, status };
}
