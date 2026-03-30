/**
 * One-time v2 seed script — clears Firestore and re-populates from
 * Sydney + Tasmania 2026_v2.xlsx content.
 *
 * Usage:
 *   export $(grep -v '^#' .env.local | xargs) && node src/scripts/seedV2.js
 *
 * Safe to re-run — clears then overwrites.
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDocs, deleteDoc, collection } from 'firebase/firestore';

const firebaseConfig = {
  apiKey:            process.env.VITE_FIREBASE_API_KEY,
  authDomain:        process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             process.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ─── Geocoding ───────────────────────────────────────────────────────────────
async function geocode(address) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(address)}`;
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'trip-tracker-seed/2.0' } });
    const data = await res.json();
    if (data.length > 0) {
      const lat = parseFloat(data[0].lat);
      const lng = parseFloat(data[0].lon);
      console.log(`    📍 geocoded "${address}" → ${lat}, ${lng}`);
      return { lat, lng };
    }
  } catch (e) {
    console.warn(`    ⚠️  geocode failed for "${address}": ${e.message}`);
  }
  return { lat: null, lng: null };
}

// Geocode any activity that has an address but no coords; rate-limit to ~1 req/sec
async function geocodeActivities(activities) {
  const result = [];
  for (const act of activities) {
    if (act.address && act.lat == null) {
      await new Promise((r) => setTimeout(r, 1100)); // Nominatim rate limit
      const coords = await geocode(act.address);
      result.push({ ...act, ...coords });
    } else {
      result.push(act);
    }
  }
  return result;
}

// ─── Clear ───────────────────────────────────────────────────────────────────
async function clearCollection(name) {
  const snap = await getDocs(collection(db, name));
  for (const d of snap.docs) await deleteDoc(d.ref);
  console.log(`  🗑  cleared ${snap.size} docs from "${name}"`);
}

// ─── V2 Data ─────────────────────────────────────────────────────────────────

const ACCOMMODATIONS = [
  {
    id: 'acc-syd',
    name: 'Airbnb Sydney',
    address: '72 Macarthur Street, Ultimo, NSW 2007',
    checkIn: '2026-05-08',
    checkOut: '2026-05-10',
    notes: 'Check-in time 3pm',
    lat: -33.8791,
    lng: 151.1983,
  },
  {
    id: 'acc-lst',
    name: 'Airbnb Launceston',
    address: '5 Avenger Avenue, Kings Meadows, TAS 7249',
    checkIn: '2026-05-10',
    checkOut: '2026-05-12',
    notes: null,
    lat: -41.4689,
    lng: 147.1610,
  },
  {
    id: 'acc-swn',
    name: 'Airbnb Swansea',
    address: '3 Bluff Circle, Swansea, TAS 7190',
    checkIn: '2026-05-12',
    checkOut: '2026-05-13',
    notes: null,
    lat: -42.1255,
    lng: 148.0755,
  },
  {
    id: 'acc-hbt',
    name: 'Airbnb Hobart (Berriedale)',
    address: '12 Chablis Court, Berriedale, TAS 7011',
    checkIn: '2026-05-13',
    checkOut: '2026-05-16',
    notes: null,
    lat: -42.8047,
    lng: 147.2679,
  },
  {
    id: 'acc-mel',
    name: 'Novotel Melbourne Hotel',
    address: '270 Collins St, Melbourne VIC 3000',
    checkIn: '2026-05-16',
    checkOut: '2026-05-17',
    notes: null,
    lat: -37.8158,
    lng: 144.9651,
  },
];

const DAYS = [
  // ── Day 1 ─────────────────────────────────────────────────────────────────
  {
    id: 'day-1',
    date: '2026-05-07',
    label: 'Departure — HKG to Sydney',
    locationId: 'syd',
    flights: [
      {
        id: 'fl-1',
        type: 'flight',
        from: { code: 'HKG', name: 'Hong Kong International' },
        to:   { code: 'SYD', name: 'Sydney Kingsford Smith' },
        departureTime: '2026-05-07T21:35:00',
        arrivalTime:   '2026-05-08T08:40:00',
        notes: null,
      },
    ],
    activities: [],
  },

  // ── Day 2 ─────────────────────────────────────────────────────────────────
  {
    id: 'day-2',
    date: '2026-05-08',
    label: 'Arrive Sydney',
    locationId: 'syd',
    flights: [],
    activities: [],
  },

  // ── Day 3 ─────────────────────────────────────────────────────────────────
  {
    id: 'day-3',
    date: '2026-05-09',
    label: 'Sydney — Explore',
    locationId: 'syd',
    flights: [],
    activities: [
      {
        id: 'act-syd-1',
        name: 'Sydney Saturday Market',
        type: 'activity',
        time: null,
        duration: null,
        notes: "Paddy's Markets — open Wed–Sun 10am–6pm. 10 min walk from Ultimo Airbnb.",
        address: '9-13 Hay St, Haymarket NSW 2000',
        lat: -33.8793,
        lng: 151.2044,
      },
    ],
  },

  // ── Day 4 ─────────────────────────────────────────────────────────────────
  {
    id: 'day-4',
    date: '2026-05-10',
    label: 'Fly to Launceston — Cataract Gorge & Truffle Farm',
    locationId: 'lst',
    flights: [
      {
        id: 'fl-2',
        type: 'flight',
        from: { code: 'SYD', name: 'Sydney Airport' },
        to:   { code: 'LST', name: 'Launceston Airport' },
        departureTime: '2026-05-10T07:25:00',
        arrivalTime:   '2026-05-10T09:10:00',
        notes: 'Rental car: Apex Car — collect at airport',
      },
    ],
    activities: [
      {
        id: 'act-lst-1',
        name: 'Cataract Gorge Reserve',
        type: 'activity',
        time: '2026-05-10T11:00:00',
        duration: '2h',
        notes: '~15 min drive from airport. Chairlift, swimming basin, peacocks, suspension bridge.',
        address: '69 Basin Road, West Launceston TAS 7250',
        lat: -41.4411,
        lng: 147.1279,
      },
      {
        id: 'act-lst-2',
        name: 'The Truffle Farm',
        type: 'tour',
        time: '2026-05-10T14:00:00',
        duration: '2h',
        notes: "~50 min drive. Tasmania's original truffle farm.",
        address: '844 Mole Creek Rd, Deloraine TAS 7304',
        lat: -41.5150,
        lng: 146.6450,
      },
    ],
  },

  // ── Day 5 ─────────────────────────────────────────────────────────────────
  {
    id: 'day-5',
    date: '2026-05-11',
    label: 'Sheffield Murals & Cradle Mountain',
    locationId: 'lst',
    flights: [],
    activities: [
      {
        id: 'act-lst-3',
        name: 'Sheffield — Mural Town',
        type: 'activity',
        time: null,
        duration: null,
        notes: '~1 hr drive. Walk around town — Mural Art and Mural Park.',
        address: 'Main St, Sheffield TAS 7306',
        lat: -41.3880,
        lng: 146.3532,
      },
      {
        id: 'act-lst-4',
        name: 'Cradle Mountain National Park',
        type: 'activity',
        time: null,
        duration: 'Full day',
        notes:
          "Marions Lookout: 3-hour hike with spectacular views of Cradle Mountain and Dove Lake.\n" +
          'Dove Lake Circuit: 2-hour flat circuit, iconic views, family-friendly.\n' +
          'Wombats frequently spotted around Ronny Creek.\n' +
          '~1 hr drive from Sheffield.',
        address: 'Cradle Mountain Visitor Centre, 4038 Cradle Mountain Rd, TAS 7306',
        lat: -41.6386,
        lng: 145.9470,
      },
    ],
  },

  // ── Day 6 ─────────────────────────────────────────────────────────────────
  {
    id: 'day-6',
    date: '2026-05-12',
    label: 'Ross → Freycinet National Park → Swansea',
    locationId: 'swn',
    flights: [],
    activities: [
      {
        id: 'act-swn-1',
        name: 'Ross — Heritage Town',
        type: 'activity',
        time: null,
        duration: null,
        notes: '~1 hr drive from Launceston. Ross Bridge, Ross Bakery (famous vanilla slice).',
        address: 'Church St, Ross TAS 7209',
        lat: -41.9100,
        lng: 147.4876,
      },
      {
        id: 'act-swn-2',
        name: 'Melshell Oyster Shack',
        type: 'food',
        time: null,
        duration: null,
        notes: 'Oyster bar on the way to Freycinet. ~1 hr drive from Ross.',
        address: '1 Jetty Rd, Swanwick TAS 7190',
        lat: -42.0240,
        lng: 148.2936,
      },
      {
        id: 'act-swn-3',
        name: 'Freycinet National Park — Wineglass Bay',
        type: 'activity',
        time: null,
        duration: null,
        notes: 'Wineglass Bay Lookout trail: 6.1 km, ~2 hr 15 min. Car park at Freycinet National Park Visitor Centre.',
        address: 'Freycinet National Park Visitor Centre, Coles Bay TAS 7215',
        lat: -42.1504,
        lng: 148.2988,
      },
    ],
  },

  // ── Day 7 ─────────────────────────────────────────────────────────────────
  {
    id: 'day-7',
    date: '2026-05-13',
    label: 'Drive to Hobart — Seafood Adventure & Mount Wellington',
    locationId: 'hbt',
    flights: [],
    activities: [
      {
        id: 'act-hbt-1',
        name: 'Check out Swansea Airbnb & drive to Hobart',
        type: 'transport',
        time: '2026-05-13T07:45:00',
        duration: '2h',
        notes: '~2 hr drive to Hobart.',
        address: '3 Bluff Circle, Swansea TAS 7190',
        lat: -42.1255,
        lng: 148.0755,
      },
      {
        id: 'act-hbt-2',
        name: 'Seafood Wildlife Adventure',
        type: 'tour',
        time: '2026-05-13T10:00:00',
        duration: '4h 30m',
        notes: 'Departs Elizabeth Street Pier.',
        address: 'Elizabeth Street Pier, Hobart TAS 7000',
        lat: -42.8840,
        lng: 147.3327,
      },
      {
        id: 'act-hbt-3',
        name: 'kunanyi / Mount Wellington',
        type: 'activity',
        time: '2026-05-13T15:00:00',
        duration: '2h',
        notes:
          '~30 min drive. The Spring: parking, toilets, short walks (Wellington Falls track). ' +
          'The Pinnacle: 360° glass viewing platform.\n' +
          '山腰處設有停車場、洗手間和短程步行步道。山頂擁有巨大的岩石景觀和360度視野的玻璃觀景台。',
        address: 'The Pinnacle, Pinnacle Rd, Mount Wellington TAS 7054',
        lat: -42.8968,
        lng: 147.2328,
      },
    ],
  },

  // ── Day 8 ─────────────────────────────────────────────────────────────────
  {
    id: 'day-8',
    date: '2026-05-14',
    label: 'Richmond & Tasman Peninsula',
    locationId: 'hbt',
    flights: [],
    activities: [
      {
        id: 'act-hbt-4',
        name: 'Richmond — Historic Town',
        type: 'activity',
        time: '2026-05-14T09:00:00',
        duration: '1h',
        notes: '~30 min drive from Hobart. Walk around town.',
        address: 'Bridge St, Richmond TAS 7025',
        lat: -42.7353,
        lng: 147.4381,
      },
      {
        id: 'act-hbt-5',
        name: 'Tasman Peninsula',
        type: 'activity',
        time: '2026-05-14T12:30:00',
        duration: '4h 30m',
        notes:
          '鷹脖灣 — Eaglehawk Neck\n' +
          '噴水洞 — The Blowhole\n' +
          '塔斯曼拱門 — Tasman Arch\n' +
          '棋盤道 — Tessellated Pavement\n' +
          '魔鬼廚房 — Devils Kitchen\n' +
          '亞瑟港歷史遺址 — Port Arthur Historic Site\n\n' +
          "Top Short & Scenic Walks (under 2 hours):\n" +
          "Waterfall Bay: 1.7 km one-way (1–1.5 hrs). Stunning sea cliff views.\n" +
          "Remarkable Cave to Maingon Blowhole: 3.5 km loop (~1 hour).\n" +
          "Tasman Arch to Devil's Kitchen: ~1 km.\n" +
          '~1.5 hr drive back to Hobart.',
        address: 'Arthur Hwy, Port Arthur TAS 7182',
        lat: -43.1457,
        lng: 147.8494,
      },
    ],
  },

  // ── Day 9 ─────────────────────────────────────────────────────────────────
  {
    id: 'day-9',
    date: '2026-05-15',
    label: 'Bruny Island Day Trip',
    locationId: 'hbt',
    flights: [],
    activities: [
      {
        id: 'act-hbt-6',
        name: 'Kettering Ferry Terminal',
        type: 'transport',
        time: null,
        duration: null,
        notes: '20 min car ferry ride to Bruny Island. Ferries run 6am–7pm.',
        address: 'Ferry Rd, Kettering TAS 7155',
        lat: -43.1059,
        lng: 147.2269,
      },
      {
        id: 'act-hbt-7',
        name: 'Get Shucked — Fresh Oysters',
        type: 'food',
        time: null,
        duration: null,
        notes: 'Fresh oysters on Bruny Island.',
        address: '3240 Bruny Island Main Rd, Great Bay TAS 7150',
        lat: -43.3468,
        lng: 147.0232,
      },
      {
        id: 'act-hbt-8',
        name: 'The Neck Lookout',
        type: 'activity',
        time: null,
        duration: null,
        notes: 'Bruny Island Neck — isthmus connecting North and South Bruny Island. Penguin rookery.',
        address: 'Isthmus Rd, Bruny Island TAS 7150',
        lat: -43.2904,
        lng: 147.0590,
      },
      {
        id: 'act-hbt-9',
        name: 'Cape Bruny Lighthouse',
        type: 'activity',
        time: null,
        duration: null,
        notes: "Australia's second oldest lighthouse, built 1836.",
        address: '137 Cape Bruny Rd, Lunawanna TAS 7150',
        lat: -43.5021,
        lng: 146.8903,
      },
    ],
  },

  // ── Day 10 ────────────────────────────────────────────────────────────────
  {
    id: 'day-10',
    date: '2026-05-16',
    label: 'Salamanca Market → Lark Distillery → Fly to Melbourne',
    locationId: 'mel',
    flights: [
      {
        id: 'fl-3',
        type: 'flight',
        from: { code: 'HBA', name: 'Hobart Airport' },
        to:   { code: 'MEL', name: 'Melbourne Airport' },
        departureTime: '2026-05-16T19:20:00',
        arrivalTime:   '2026-05-16T20:45:00',
        notes: null,
      },
    ],
    activities: [
      {
        id: 'act-hbt-10',
        name: 'Salamanca Market',
        type: 'activity',
        time: '2026-05-16T09:00:00',
        duration: '2h',
        notes: "Open 8:30am–3pm every Saturday. Hobart's iconic waterfront market.",
        address: 'Salamanca Place, Hobart TAS 7000',
        lat: -42.8822,
        lng: 147.3305,
      },
      {
        id: 'act-hbt-11',
        name: 'Salamanca Fresh — Battery Point',
        type: 'activity',
        time: null,
        duration: null,
        notes: 'Souvenir shopping in Battery Point, the historic village behind Salamanca.',
        address: '2 Castray Esplanade, Battery Point TAS 7004',
        lat: -42.8864,
        lng: 147.3306,
      },
      {
        id: 'act-hbt-12',
        name: 'Lark Distillery — Production & Site Tour',
        type: 'tour',
        time: '2026-05-16T12:00:00',
        duration: '1h',
        notes: '~40 min drive from Hobart. Tasmanian single malt whisky.',
        address: '76 Shene Road, Pontville TAS 7030',
        lat: -42.6540,
        lng: 147.2672,
      },
      {
        id: 'act-hbt-13',
        name: 'Bonorong Wildlife Sanctuary',
        type: 'tour',
        time: '2026-05-16T13:00:00',
        duration: '3h',
        notes: '~10 min drive from Lark Distillery. Feed kangaroos, see wombats, quolls, Tasmanian devils.',
        address: '593 Briggs Rd, Brighton TAS 7030',
        lat: -42.6310,
        lng: 147.2680,
      },
    ],
  },

  // ── Day 11 ────────────────────────────────────────────────────────────────
  {
    id: 'day-11',
    date: '2026-05-17',
    label: 'Fly Home — Melbourne to Hong Kong',
    locationId: 'mel',
    flights: [
      {
        id: 'fl-4a',
        type: 'flight',
        from: { code: 'MEL', name: 'Melbourne Airport' },
        to:   { code: 'HKG', name: 'Hong Kong International' },
        departureTime: '2026-05-17T10:15:00',
        arrivalTime:   '2026-05-17T17:55:00',
        notes: 'Passenger 1',
      },
      {
        id: 'fl-4b',
        type: 'flight',
        from: { code: 'MEL', name: 'Melbourne Airport' },
        to:   { code: 'HKG', name: 'Hong Kong International' },
        departureTime: '2026-05-17T14:25:00',
        arrivalTime:   '2026-05-17T21:45:00',
        notes: 'Passenger 2',
      },
    ],
    activities: [],
  },
];

// ─── Seed ─────────────────────────────────────────────────────────────────────
async function seed() {
  console.log('\n🗑  Clearing existing Firestore data...');
  await clearCollection('days');
  await clearCollection('accommodations');

  console.log('\n🌱 Seeding accommodations...');
  for (const acc of ACCOMMODATIONS) {
    let data = { ...acc };
    if (data.address && data.lat == null) {
      await new Promise((r) => setTimeout(r, 1100));
      const coords = await geocode(data.address);
      data = { ...data, ...coords };
    }
    await setDoc(doc(db, 'accommodations', data.id), data);
    console.log(`  ✓ accommodations/${data.id}  (${data.name})  lat:${data.lat ?? 'null'}`);
  }

  console.log('\n🌱 Seeding days...');
  for (const day of DAYS) {
    const activities = await geocodeActivities(day.activities);
    const data = { ...day, activities };
    await setDoc(doc(db, 'days', data.id), data);
    console.log(`  ✓ days/${data.id}  (${data.date}  ${data.label})  — ${activities.length} activities`);
  }

  console.log('\n✅  Firestore seeded with v2 data successfully.');
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌  Seed failed:', err);
  process.exit(1);
});
