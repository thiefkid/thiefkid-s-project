import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ActivityItem from '../components/itinerary/ActivityItem.jsx';

const activityWithLocation = {
  id: 'act-1',
  name: 'Cataract Gorge Reserve',
  type: 'activity',
  time: null,
  duration: '2h',
  notes: null,
  bookingRef: null,
  lat: -41.4411,
  lng: 147.1279,
};

const activityWithoutLocation = {
  id: 'act-2',
  name: 'Rest Day',
  type: 'free',
  time: null,
  duration: null,
  notes: null,
  bookingRef: null,
  lat: null,
  lng: null,
};

describe('ActivityItem', () => {
  it('shows Map button when activity has lat/lng', () => {
    render(<ActivityItem activity={activityWithLocation} onShowOnMap={vi.fn()} />);
    expect(screen.getByTitle('Show on map')).toBeInTheDocument();
    expect(screen.getByText(/Map/)).toBeInTheDocument();
  });

  it('hides Map button when activity has no lat/lng', () => {
    render(<ActivityItem activity={activityWithoutLocation} onShowOnMap={vi.fn()} />);
    expect(screen.queryByTitle('Show on map')).not.toBeInTheDocument();
  });

  it('calls onShowOnMap with correct lat/lng when Map button is clicked', async () => {
    const onShowOnMap = vi.fn();
    render(<ActivityItem activity={activityWithLocation} onShowOnMap={onShowOnMap} />);

    await userEvent.click(screen.getByTitle('Show on map'));

    expect(onShowOnMap).toHaveBeenCalledOnce();
    expect(onShowOnMap).toHaveBeenCalledWith({
      lat: -41.4411,
      lng: 147.1279,
      zoom: 15,
      label: 'Cataract Gorge Reserve',
    });
  });

  it('does NOT have a direct Google Maps link in itinerary (only in map popup)', () => {
    render(<ActivityItem activity={activityWithLocation} onShowOnMap={vi.fn()} />);
    // No <a> tag linking to Google Maps — that link lives in the Map tab popup only
    const links = screen.queryAllByRole('link');
    const googleMapsLinks = links.filter(l => l.href?.includes('google.com/maps'));
    expect(googleMapsLinks).toHaveLength(0);
  });
});
