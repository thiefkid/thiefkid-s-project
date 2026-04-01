import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App.jsx';

describe('Route pill location navigation', () => {
  it('renders clickable route pills for SYD, LST, HBT, MEL', () => {
    render(<App />);
    // SYD, LST, HBT, MEL should be buttons
    expect(screen.getByRole('button', { name: 'SYD' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'LST' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'HBT' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'MEL' })).toBeInTheDocument();
  });

  it('renders HKG as non-clickable (not a trip destination)', () => {
    render(<App />);
    // HKG should appear as text, not as a button
    const buttons = screen.queryAllByRole('button', { name: 'HKG' });
    expect(buttons).toHaveLength(0);
    // But the text should still be visible
    expect(screen.getAllByText('HKG').length).toBeGreaterThanOrEqual(1);
  });

  it('day cards have data-location-id attributes for scroll targeting', () => {
    render(<App />);
    const locationIds = ['syd', 'lst', 'swn', 'hbt', 'mel'];
    locationIds.forEach((locId) => {
      const cards = document.querySelectorAll(`[data-location-id="${locId}"]`);
      expect(cards.length).toBeGreaterThanOrEqual(1);
    });
  });

  it('clicking a route pill switches to itinerary tab', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Switch to map tab first
    const tabBar = screen.getByTestId('tab-bar-wrapper');
    const mapTab = within(tabBar).getByText(/map/i);
    await user.click(mapTab);

    // Now click SYD route pill
    await user.click(screen.getByRole('button', { name: 'SYD' }));

    // Should be back on itinerary — check that day cards are visible
    const sydCards = document.querySelectorAll('[data-location-id="syd"]');
    expect(sydCards.length).toBeGreaterThanOrEqual(1);
  });
});
