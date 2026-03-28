import { render } from '@testing-library/react';
import { mockFlyTo } from './setup.jsx';
import MapView from '../components/map/MapView.jsx';

beforeEach(() => {
  mockFlyTo.mockClear();
});

describe('MapView — FlyToTarget', () => {
  it('does not call flyTo when mapTarget is null', () => {
    render(<MapView mapTarget={null} onMapTargetConsumed={vi.fn()} />);
    expect(mockFlyTo).not.toHaveBeenCalled();
  });

  it('calls flyTo with correct coordinates when mapTarget is set', () => {
    const target = { lat: -41.4411, lng: 147.1279, zoom: 15, label: 'Cataract Gorge' };
    render(<MapView mapTarget={target} onMapTargetConsumed={vi.fn()} />);
    expect(mockFlyTo).toHaveBeenCalledOnce();
    expect(mockFlyTo).toHaveBeenCalledWith([-41.4411, 147.1279], 15, { duration: 1.2 });
  });

  it('calls onMapTargetConsumed after flyTo so target is cleared', () => {
    const target = { lat: -41.4411, lng: 147.1279, zoom: 15, label: 'Cataract Gorge' };
    const onConsumed = vi.fn();
    render(<MapView mapTarget={target} onMapTargetConsumed={onConsumed} />);
    expect(onConsumed).toHaveBeenCalledOnce();
  });
});
