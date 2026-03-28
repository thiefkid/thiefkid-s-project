import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App.jsx';

describe('App — itinerary → map navigation', () => {
  it('starts on the itinerary tab', () => {
    render(<App />);
    // Itinerary content visible
    expect(screen.getByText('Itinerary')).toBeInTheDocument();
    // Map container not mounted yet
    expect(screen.queryByTestId('map-container')).not.toBeInTheDocument();
  });

  it('switches to map tab when the Map tab button is clicked', async () => {
    render(<App />);
    await userEvent.click(screen.getByRole('button', { name: /map/i }));
    expect(screen.getByTestId('map-container')).toBeInTheDocument();
  });

  it('switches to map tab when 📍 is clicked on an activity', async () => {
    render(<App />);

    // Should be on itinerary tab — map not mounted
    expect(screen.queryByTestId('map-container')).not.toBeInTheDocument();

    // Find the first visible 📍 button (activities with lat/lng)
    const pinButtons = screen.getAllByTitle('Show on map');
    expect(pinButtons.length).toBeGreaterThan(0);

    await userEvent.click(pinButtons[0]);

    // Map tab should now be active
    expect(screen.getByTestId('map-container')).toBeInTheDocument();
    // Itinerary should be unmounted
    expect(screen.queryByTitle('Show on map')).not.toBeInTheDocument();
  });
});
