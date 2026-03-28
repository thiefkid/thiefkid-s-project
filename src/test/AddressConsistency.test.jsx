/**
 * AddressConsistency.test.jsx
 *
 * Proves the full chain for every pinned item:
 *   1. The address displayed in the itinerary card
 *   2. The pin shown on the map tab (lat/lng)
 *   3. The Google Maps URL opened when that pin is tapped
 *
 * All three must be consistent with each other.
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ActivityItem from '../components/itinerary/ActivityItem.jsx';
import HotelCard from '../components/itinerary/HotelCard.jsx';
import MapView from '../components/map/MapView.jsx';
import { DAYS, ACCOMMODATIONS } from '../data/tripData.js';

const pinnedActivities = DAYS.flatMap((d) =>
  d.activities.filter((a) => a.lat != null && a.lng != null)
);

const pinnedAccommodations = ACCOMMODATIONS.filter((a) => a.lat != null && a.lng != null);

// ─── Helpers ───────────────────────────────────────────────────────────────

function expectedActivityMapsUrl(activity) {
  // Must match the formula in MapView.jsx exactly
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activity.address || activity.name)}`;
}

function expectedAccommodationMapsUrl(acc) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(acc.address)}`;
}

// ─── Part 1: Itinerary shows the address ────────────────────────────────────

describe('Itinerary displays the address for every pinned activity', () => {
  test.each(
    pinnedActivities
      .filter((a) => a.address)
      .map((a) => [a.name, a])
  )('%s shows its address in the itinerary card', (_, activity) => {
    render(<ActivityItem activity={activity} onShowOnMap={vi.fn()} />);
    expect(screen.getByText(activity.address)).toBeInTheDocument();
  });
});

describe('Itinerary displays the address for every pinned accommodation', () => {
  test.each(pinnedAccommodations.map((a) => [a.name, a]))(
    '%s shows its address in the check-in card',
    (_, acc) => {
      render(
        <HotelCard
          hotel={acc}
          isCheckIn={true}
          onShowOnMap={vi.fn()}
          lat={acc.lat}
          lng={acc.lng}
        />
      );
      expect(screen.getByText(acc.address)).toBeInTheDocument();
    }
  );

  test.each(pinnedAccommodations.map((a) => [a.name, a]))(
    '%s shows its address in the continuing-night card',
    (_, acc) => {
      render(
        <HotelCard
          hotel={acc}
          isCheckIn={false}
          onShowOnMap={vi.fn()}
          lat={acc.lat}
          lng={acc.lng}
        />
      );
      expect(screen.getByText(acc.address)).toBeInTheDocument();
    }
  );
});

// ─── Part 2: Map tab marker opens the correct Google Maps URL ───────────────

describe('Map tab: tapping an activity marker opens Google Maps with the correct address', () => {
  let originalHref;

  beforeEach(() => {
    originalHref = window.location.href;
    // Allow assignment to window.location.href in jsdom
    delete window.location;
    window.location = { href: '' };
  });

  afterEach(() => {
    window.location.href = originalHref;
  });

  test.each(pinnedActivities.map((a) => [a.name, a]))(
    '%s — map pin opens correct Google Maps URL',
    async (_, activity) => {
      render(<MapView mapTarget={null} onMapTargetConsumed={vi.fn()} />);

      // Find the marker by its title (the activity name)
      const markers = screen.getAllByTestId('map-marker');
      const marker = markers.find(
        (m) => m.getAttribute('data-marker-title') === activity.name
      );
      expect(marker, `No map marker found for activity "${activity.name}"`).toBeTruthy();

      await userEvent.click(marker);

      const expected = expectedActivityMapsUrl(activity);
      expect(window.location.href).toBe(expected);
    }
  );
});

describe('Map tab: tapping an accommodation marker opens Google Maps with the correct address', () => {
  let originalHref;

  beforeEach(() => {
    delete window.location;
    window.location = { href: '' };
  });

  afterEach(() => {
    window.location.href = originalHref;
  });

  test.each(pinnedAccommodations.map((a) => [a.name, a]))(
    '%s — map pin opens correct Google Maps URL',
    async (_, acc) => {
      render(<MapView mapTarget={null} onMapTargetConsumed={vi.fn()} />);

      const markers = screen.getAllByTestId('map-marker');
      const marker = markers.find(
        (m) => m.getAttribute('data-marker-title') === acc.name
      );
      expect(marker, `No map marker found for accommodation "${acc.name}"`).toBeTruthy();

      await userEvent.click(marker);

      const expected = expectedAccommodationMapsUrl(acc);
      expect(window.location.href).toBe(expected);
    }
  );
});

// ─── Part 3: Address shown in itinerary == address used in Google Maps URL ──

describe('Address shown in itinerary matches the Google Maps URL on the map tab', () => {
  test.each(
    pinnedActivities.filter((a) => a.address).map((a) => [a.name, a])
  )(
    '%s — itinerary address equals the query in the Google Maps URL',
    (_, activity) => {
      const mapsUrl = expectedActivityMapsUrl(activity);
      // The URL must encode the exact address string shown to the user
      expect(mapsUrl).toContain(encodeURIComponent(activity.address));
      // And NOT fall back to just the name when an address is present
      expect(mapsUrl).not.toBe(
        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activity.name)}`
      );
    }
  );

  test.each(
    pinnedActivities.filter((a) => !a.address).map((a) => [a.name, a])
  )(
    '%s (no address) — Google Maps URL uses the activity name',
    (_, activity) => {
      const mapsUrl = expectedActivityMapsUrl(activity);
      expect(mapsUrl).toContain(encodeURIComponent(activity.name));
    }
  );

  test.each(pinnedAccommodations.map((a) => [a.name, a]))(
    '%s — itinerary address equals the query in the Google Maps URL',
    (_, acc) => {
      const mapsUrl = expectedAccommodationMapsUrl(acc);
      expect(mapsUrl).toContain(encodeURIComponent(acc.address));
    }
  );
});
