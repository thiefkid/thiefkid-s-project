import { useEffect, useState } from 'react';
import { collection, onSnapshot, setDoc, doc } from 'firebase/firestore';
import { db } from '../firebase.js';

export function useVotes() {
  const [votersByOption, setVotersByOption] = useState({});

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'votes'), (snap) => {
      const result = {};
      snap.forEach((d) => {
        result[d.id] = d.data().voters ?? {};
      });
      setVotersByOption(result);
    });
    return unsub;
  }, []);

  async function submitVote(optionId, name, choice) {
    const ref = doc(db, 'votes', optionId);
    await setDoc(ref, { voters: { [name.trim().toLowerCase()]: choice } }, { merge: true });
  }

  return { votersByOption, submitVote };
}
