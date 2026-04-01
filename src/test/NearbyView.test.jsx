import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

// We override the global mock from setup.jsx per-test via vi.mocked()
import { useNearby } from '../hooks/useNearby.js';
import NearbyView from '../components/nearby/NearbyView.jsx';

const MOCK_RESTAURANTS = [
  {
    name: 'Sushi Dai',
    address: '123 Main St, Sydney NSW 2000',
    rating: 4.8,
    ratingCount: 320,
    lat: -33.87,
    lng: 151.21,
    distance: 450,
    googleMapsUrl: 'https://maps.google.com/?cid=111',
  },
  {
    name: 'Pasta Palace',
    address: '456 George St, Sydney NSW 2000',
    rating: 4.5,
    ratingCount: 180,
    lat: -33.872,
    lng: 151.208,
    distance: 1200,
    googleMapsUrl: 'https://maps.google.com/?cid=222',
  },
];

const MOCK_ATTRACTIONS = [
  {
    name: 'Sydney Opera House',
    address: 'Bennelong Point, Sydney NSW 2000',
    rating: 4.7,
    ratingCount: 52000,
    lat: -33.8568,
    lng: 151.2153,
    distance: 3200,
    googleMapsUrl: 'https://maps.google.com/?cid=333',
  },
];

function mockHook(overrides) {
  vi.mocked(useNearby).mockReturnValue({
    status: 'done',
    error: null,
    coords: { lat: -33.8688, lng: 151.2093 },
    restaurants: [],
    attractions: [],
    refresh: vi.fn(),
    ...overrides,
  });
}

describe('NearbyView', () => {
  it('shows locating spinner when getting user position', () => {
    mockHook({ status: 'locating' });
    render(<NearbyView />);
    expect(screen.getByText(/getting your location/i)).toBeInTheDocument();
  });

  it('shows fetching spinner when querying places', () => {
    mockHook({ status: 'fetching' });
    render(<NearbyView />);
    expect(screen.getByText(/finding nearby places/i)).toBeInTheDocument();
  });

  it('shows error state with Try Again button', async () => {
    const refresh = vi.fn();
    mockHook({
      status: 'error',
      error: 'Location permission denied. Please enable location access in your browser settings.',
      refresh,
    });
    const user = userEvent.setup();
    render(<NearbyView />);

    expect(screen.getByText(/location permission denied/i)).toBeInTheDocument();
    const btn = screen.getByRole('button', { name: /try again/i });
    expect(btn).toBeInTheDocument();

    await user.click(btn);
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it('renders restaurant cards with name, rating, distance and Maps link', () => {
    mockHook({ restaurants: MOCK_RESTAURANTS });
    render(<NearbyView />);

    expect(screen.getByText('Sushi Dai')).toBeInTheDocument();
    expect(screen.getByText('Pasta Palace')).toBeInTheDocument();
    expect(screen.getByText(/4\.8/)).toBeInTheDocument();
    expect(screen.getByText('450m')).toBeInTheDocument();
    expect(screen.getByText('1.2km')).toBeInTheDocument();

    // Section heading
    expect(screen.getByText(/top restaurants/i)).toBeInTheDocument();
  });

  it('renders attraction cards', () => {
    mockHook({ attractions: MOCK_ATTRACTIONS });
    render(<NearbyView />);

    expect(screen.getByText('Sydney Opera House')).toBeInTheDocument();
    expect(screen.getByText(/top attractions/i)).toBeInTheDocument();
  });

  it('Maps links point to correct URLs and open in new tab', () => {
    mockHook({ restaurants: MOCK_RESTAURANTS });
    render(<NearbyView />);

    const mapsLinks = screen.getAllByRole('link', { name: /maps/i });
    expect(mapsLinks.length).toBeGreaterThanOrEqual(1);
    expect(mapsLinks[0]).toHaveAttribute('href', 'https://maps.google.com/?cid=111');
    expect(mapsLinks[0]).toHaveAttribute('target', '_blank');
  });

  it('shows empty state when no places found', () => {
    mockHook({ restaurants: [], attractions: [] });
    render(<NearbyView />);

    expect(screen.getByText(/no places found within 5 km/i)).toBeInTheDocument();
  });

  it('shows refresh button when results are present', () => {
    mockHook({ restaurants: MOCK_RESTAURANTS });
    render(<NearbyView />);

    expect(screen.getByText(/tap to refresh/i)).toBeInTheDocument();
  });

  it('calls refresh when refresh button is clicked', async () => {
    const refresh = vi.fn();
    mockHook({ restaurants: MOCK_RESTAURANTS, refresh });
    const user = userEvent.setup();
    render(<NearbyView />);

    await user.click(screen.getByText(/tap to refresh/i));
    expect(refresh).toHaveBeenCalledTimes(1);
  });
});
