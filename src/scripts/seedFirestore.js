/**
 * One-time seed script — writes all DAYS and ACCOMMODATIONS from tripData.js
 * into Firestore so the app reads from a single source of truth.
 *
 * Usage:
 *   VITE_FIREBASE_PROJECT_ID=xxx \
 *   VITE_FIREBASE_API_KEY=xxx \
 *   ... (other VITE_FIREBASE_* vars) \
 *   node src/scripts/seedFirestore.js
 *
 * Or copy your .env.local values into the environment first:
 *   export $(cat .env.local | xargs) && node src/scripts/seedFirestore.js
 *
 * Safe to re-run — it overwrites existing documents with the same ID.
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

// Load env vars (Vite bakes these in for the browser; here we read them directly)
const firebaseConfig = {
  apiKey:            process.env.VITE_FIREBASE_API_KEY,
  authDomain:        process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             process.env.VITE_FIREBASE_APP_ID,
};

// Import seed data — Node can import ESM with --experimental-vm-modules or
// use a plain dynamic import. We use a local file path import here.
const { DAYS, ACCOMMODATIONS } = await import('../data/tripData.js');

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function seed() {
  console.log(`Seeding ${DAYS.length} days...`);
  for (const day of DAYS) {
    await setDoc(doc(db, 'days', day.id), day);
    console.log(`  ✓ days/${day.id}  (${day.date}  ${day.label})`);
  }

  console.log(`\nSeeding ${ACCOMMODATIONS.length} accommodations...`);
  for (const acc of ACCOMMODATIONS) {
    await setDoc(doc(db, 'accommodations', acc.id), acc);
    console.log(`  ✓ accommodations/${acc.id}  (${acc.name})`);
  }

  console.log('\n✅  Firestore seeded successfully.');
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌  Seed failed:', err);
  process.exit(1);
});
