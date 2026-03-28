/**
 * MapNavigation.test.jsx
 *
 * For every activity AND accommodation that has lat/lng, verifies that
 * clicking its "📍 Map" button calls onShowOnMap with the EXACT coordinates
 * stored in tripData.js — proving the correct pin will be shown on the map.
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DayCard from '../components/itinerary/DayCard.jsx';
import { DAYS, ACCOMMODATIONS } from '../data/tripData.js';

// Collect every activity that has a map pin, along with its parent day
const pinnedActivities = DAYS.flatMap((day, i) =>
  day.activities
    .filter((a) => a.lat != null && a.lng != null)
    .map((a) => ({ activity: a, day, dayNumber: i + 1 }))
);

describe('Map navigation — every pinned activity directs to the correct coordinates', () => {
  test.each(pinnedActivities.map(({ activity, day, dayNumber }) => [
    `${day.label} › ${activity.name}`,
    activity,
    day,
    dayNumber,
  ]))(
    '%s',
    async (_, activity, day, dayNumber) => {
      const onShowOnMap = vi.fn();

      render(
        <DayCard
          day={day}
          dayNumber={dayNumber}
          defaultOpen={true}
          onShowOnMap={onShowOnMap}
        />
      );

      const buttons = screen.getAllByTitle('Show on map');
      const activityIndex = day.activities
        .filter((a) => a.lat != null && a.lng != null)
        .indexOf(activity);

      await userEvent.click(buttons[activityIndex]);

      expect(onShowOnMap).toHaveBeenCalledWith({
        lat: activity.lat,
        lng: activity.lng,
        zoom: 15,
        label: activity.name,
      });
    }
  );
});

describe('Map navigation — every accommodation directs to its own address coordinates', () => {
  // Test each accommodation's map button on its check-in day
  test.each(
    ACCOMMODATIONS.filter((a) => a.lat != null && a.lng != null).map((acc) => {
      const checkInDay = DAYS.find((d) => d.date === acc.checkIn);
      const dayNumber = DAYS.indexOf(checkInDay) + 1;
      return [acc.name, acc, checkInDay, dayNumber];
    })
  )(
    '%s uses accommodation address coordinates (not city centre)',
    async (_, acc, day, dayNumber) => {
      const onShowOnMap = vi.fn();

      render(
        <DayCard
          day={day}
          dayNumber={dayNumber}
          defaultOpen={true}
          onShowOnMap={onShowOnMap}
        />
      );

      // Hotel card "Show on map" button is the LAST one in the card
      // (activity buttons come first, hotel button is last)
      const buttons = screen.getAllByTitle('Show on map');
      await userEvent.click(buttons[buttons.length - 1]);

      expect(onShowOnMap).toHaveBeenCalledWith({
        lat: acc.lat,
        lng: acc.lng,
        zoom: 13,
        label: acc.name,
      });
    }
  );
});

describe('Coordinate sanity checks — lat/lng are in Australia/Tasmania', () => {
  test.each(pinnedActivities.map(({ activity, day }) => [
    `${day.label} › ${activity.name}`,
    activity,
  ]))(
    'Activity %s is within Australia bounding box',
    (_, activity) => {
      // Australia bounding box: lat -10 to -44, lng 113 to 154
      expect(activity.lat).toBeGreaterThanOrEqual(-44);
      expect(activity.lat).toBeLessThanOrEqual(-10);
      expect(activity.lng).toBeGreaterThanOrEqual(113);
      expect(activity.lng).toBeLessThanOrEqual(154);
    }
  );

  test.each(
    ACCOMMODATIONS.filter((a) => a.lat != null).map((a) => [a.name, a])
  )(
    'Accommodation %s is within Australia bounding box',
    (_, acc) => {
      expect(acc.lat).toBeGreaterThanOrEqual(-44);
      expect(acc.lat).toBeLessThanOrEqual(-10);
      expect(acc.lng).toBeGreaterThanOrEqual(113);
      expect(acc.lng).toBeLessThanOrEqual(154);
    }
  );

  // Launceston-base activities: northern Tasmania
  test.each(
    pinnedActivities
      .filter(({ day }) => day.locationId === 'lst')
      .map(({ activity, day }) => [`${day.label} › ${activity.name}`, activity])
  )('Launceston area: %s', (_, activity) => {
    expect(activity.lat).toBeGreaterThanOrEqual(-42.0);
    expect(activity.lat).toBeLessThanOrEqual(-41.0);
    expect(activity.lng).toBeGreaterThanOrEqual(145.5);
    expect(activity.lng).toBeLessThanOrEqual(148.0);
  });

  // Swansea day: Ross pass-through + Freycinet east coast
  test.each(
    pinnedActivities
      .filter(({ day }) => day.locationId === 'swn')
      .map(({ activity, day }) => [`${day.label} › ${activity.name}`, activity])
  )('Swansea/Freycinet area: %s', (_, activity) => {
    expect(activity.lat).toBeGreaterThanOrEqual(-42.5);
    expect(activity.lat).toBeLessThanOrEqual(-41.5);
    expect(activity.lng).toBeGreaterThanOrEqual(147.4);
    expect(activity.lng).toBeLessThanOrEqual(148.5);
  });

  // Hobart activities: southern Tasmania
  test.each(
    pinnedActivities
      .filter(({ day }) => day.locationId === 'hbt')
      .map(({ activity, day }) => [`${day.label} › ${activity.name}`, activity])
  )('Hobart area: %s', (_, activity) => {
    expect(activity.lat).toBeGreaterThanOrEqual(-43.5);
    expect(activity.lat).toBeLessThanOrEqual(-42.5);
    expect(activity.lng).toBeGreaterThanOrEqual(146.8);
    expect(activity.lng).toBeLessThanOrEqual(148.5);
  });

  // Accommodations must use their own lat/lng, NOT the generic LOCATIONS coordinates
  it('Accommodations do not use generic city-centre LOCATIONS coordinates', () => {
    const { LOCATIONS } = require('../data/tripData.js');
    const locationCoords = new Set(LOCATIONS.map((l) => `${l.lat},${l.lng}`));
    ACCOMMODATIONS.filter((a) => a.lat != null).forEach((acc) => {
      const key = `${acc.lat},${acc.lng}`;
      expect(locationCoords.has(key),
        `${acc.name} uses a generic city LOCATION coordinate — it must use the actual address coordinates`
      ).toBe(false);
    });
  });
});
