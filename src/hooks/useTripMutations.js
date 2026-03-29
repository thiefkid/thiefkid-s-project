import { useCallback } from 'react';
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../firebase.js';

/**
 * Returns mutation functions for activities within a day document.
 * All writes go directly to Firestore; the useTripData onSnapshot listener
 * will pick up the change and re-render both devices automatically.
 */
export function useTripMutations() {
  const addActivity = useCallback(async (dayId, activity) => {
    const ref = doc(db, 'days', dayId);
    await updateDoc(ref, { activities: arrayUnion(activity) });
  }, []);

  const deleteActivity = useCallback(async (dayId, activity) => {
    const ref = doc(db, 'days', dayId);
    await updateDoc(ref, { activities: arrayRemove(activity) });
  }, []);

  /**
   * Replace an activity in-place.
   * Firestore arrayRemove uses deep equality so we pass the exact old object.
   */
  const updateActivity = useCallback(async (dayId, oldActivity, newActivity) => {
    const ref = doc(db, 'days', dayId);
    await updateDoc(ref, { activities: arrayRemove(oldActivity) });
    await updateDoc(ref, { activities: arrayUnion(newActivity) });
  }, []);

  return { addActivity, deleteActivity, updateActivity };
}
