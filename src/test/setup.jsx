import '@testing-library/jest-dom';

// Prevent real Firebase connections in tests
vi.mock('../firebase.js', () => ({ db: {} }));

vi.mock('../hooks/useTripData.js', async () => {
  const { DAYS, ACCOMMODATIONS } = await vi.importActual('../data/tripData.js');
  return {
    useTripData: () => ({ days: DAYS, accommodations: ACCOMMODATIONS, status: 'ok' }),
  };
});

vi.mock('../hooks/useTripMutations.js', () => ({
  useTripMutations: () => ({
    addActivity: vi.fn(),
    deleteActivity: vi.fn(),
    updateActivity: vi.fn(),
  }),
}));

vi.mock('../hooks/useVotes.js', () => ({
  useVotes: () => ({
    votersByOption: {},
    submitVote: vi.fn(),
  }),
}));

// Leaflet uses browser APIs not available in jsdom
vi.mock('leaflet', () => ({
  default: {
    Icon: {
      Default: {
        prototype: { _getIconUrl: undefined },
        mergeOptions: vi.fn(),
      },
    },
    divIcon: vi.fn(() => ({})),
  },
}));

// Mock react-leaflet — we test map behaviour via the useMap mock, not real tiles
const mockFlyTo = vi.fn();

vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }) => <div data-testid="map-container">{children}</div>,
  TileLayer: () => null,
  CircleMarker: ({ children }) => <div>{children}</div>,
  Popup: ({ children }) => <div>{children}</div>,
  Marker: ({ children, title, eventHandlers }) => (
    <div
      data-testid="map-marker"
      data-marker-title={title}
      onClick={eventHandlers?.click}
    >
      {children}
    </div>
  ),
  useMap: () => ({ flyTo: mockFlyTo }),
}));

// Export so tests can assert on it
export { mockFlyTo };
