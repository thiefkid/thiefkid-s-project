/**
 * MapNavigation.test.jsx
 *
 * For every activity that has lat/lng coordinates, this test verifies that
 * clicking its "📍 Map" button calls onShowOnMap with the EXACT coordinates
 * stored in tripData.js — proving the correct pin will be shown on the map.
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DayCard from '../components/itinerary/DayCard.jsx';
import { DAYS } from '../data/tripData.js';

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

      // Find the Map button for this specific activity by its title
      const buttons = screen.getAllByTitle('Show on map');
      // Each DayCard may have multiple activities; find the one for this activity
      // by checking which button's click fires with the right coords.
      // Since we render one DayCard, find by activity index within this day.
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

describe('Coordinate sanity checks — lat/lng are in Australia/Tasmania', () => {
  test.each(pinnedActivities.map(({ activity, day }) => [
    `${day.label} › ${activity.name}`,
    activity,
  ]))(
    '%s is within Australia bounding box',
    (_, activity) => {
      // Australia bounding box: lat -10 to -44, lng 113 to 154
      expect(activity.lat).toBeGreaterThanOrEqual(-44);
      expect(activity.lat).toBeLessThanOrEqual(-10);
      expect(activity.lng).toBeGreaterThanOrEqual(113);
      expect(activity.lng).toBeLessThanOrEqual(154);
    }
  );

  // Sydney activities must be in NSW (lat -33 to -34, lng 150.5 to 151.5)
  test.each(
    pinnedActivities
      .filter(({ day }) => day.locationId === 'syd')
      .map(({ activity, day }) => [`${day.label} › ${activity.name}`, activity])
  )('Sydney: %s', (_, activity) => {
    expect(activity.lat).toBeGreaterThanOrEqual(-34.2);
    expect(activity.lat).toBeLessThanOrEqual(-33.4);
    expect(activity.lng).toBeGreaterThanOrEqual(150.5);
    expect(activity.lng).toBeLessThanOrEqual(151.5);
  });

  // Launceston-base activities must be in northern Tasmania (lat -41 to -42, lng 145 to 148)
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

  // Swansea day includes Ross (pass-through at lng ~147.49) then Freycinet (lng ~148.3)
  // so use a wider longitude range: 147.4 to 148.5
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

  // Hobart activities: southern TAS (lat -42.5 to -43.5, lng 146.8 to 148.0)
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
});
