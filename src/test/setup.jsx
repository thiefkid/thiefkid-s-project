import '@testing-library/jest-dom';

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
  Marker: ({ children }) => <div>{children}</div>,
  useMap: () => ({ flyTo: mockFlyTo }),
}));

// Export so tests can assert on it
export { mockFlyTo };
