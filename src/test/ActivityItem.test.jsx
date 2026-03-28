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
  it('shows 📍 button and Maps link when activity has lat/lng', () => {
    render(<ActivityItem activity={activityWithLocation} onShowOnMap={vi.fn()} />);
    expect(screen.getByTitle('Show on map')).toBeInTheDocument();
    expect(screen.getByText('Maps')).toBeInTheDocument();
  });

  it('hides 📍 button when activity has no lat/lng', () => {
    render(<ActivityItem activity={activityWithoutLocation} onShowOnMap={vi.fn()} />);
    expect(screen.queryByTitle('Show on map')).not.toBeInTheDocument();
    expect(screen.queryByText('Maps')).not.toBeInTheDocument();
  });

  it('calls onShowOnMap with correct lat/lng when 📍 is clicked', async () => {
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

  it('Google Maps link points to correct coordinates', () => {
    render(<ActivityItem activity={activityWithLocation} onShowOnMap={vi.fn()} />);
    const link = screen.getByText('Maps').closest('a');
    expect(link).toHaveAttribute(
      'href',
      'https://www.google.com/maps?q=-41.4411,147.1279'
    );
    expect(link).toHaveAttribute('target', '_blank');
  });
});
