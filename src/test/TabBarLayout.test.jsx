import { render, screen, within } from '@testing-library/react';
import App from '../App.jsx';

/*
 * Layout tests for the bottom tab bar on iPhone 13 Pro Max.
 *
 * JSDOM cannot evaluate CSS env() or dvh units (it strips them from inline
 * styles). We therefore assert on:
 *   - CSS class names  (h-[100dvh] on the root div)
 *   - data-* attributes (data-bottom-pad on the wrapper — tells us which
 *     padding strategy is active, without relying on computed CSS values)
 *   - DOM structure    (4 tab buttons inside the wrapper)
 */

describe('Tab bar layout — iPhone 13 Pro Max PWA vs browser', () => {
  it('app root uses h-[100dvh] CSS class, not a JS inline height', () => {
    const { container } = render(<App />);
    const root = container.firstChild;
    expect(root.className).toMatch(/h-\[100dvh\]/);
    // No JS-driven inline height — that was the regression introduced earlier
    expect(root.style.height).toBe('');
  });

  it('tab bar wrapper carries data-bottom-pad="env-safe-area" (unconditional env() padding)', () => {
    render(<App />);
    const wrapper = screen.getByTestId('tab-bar-wrapper');
    // env(safe-area-inset-bottom) is applied unconditionally via this marker:
    //   browser mode  → resolves to 0px (viewport sits above Safari toolbar)
    //   standalone PWA → resolves to ~34px (home indicator clearance)
    expect(wrapper.dataset.bottomPad).toBe('env-safe-area');
  });

  it('renders all 4 tab buttons inside the tab bar wrapper', () => {
    render(<App />);
    const wrapper = screen.getByTestId('tab-bar-wrapper');
    // Search within the tab bar only to avoid matching "📍 Map" activity buttons
    const { getAllByRole } = within(wrapper);
    const tabButtons = getAllByRole('button');
    expect(tabButtons).toHaveLength(4);
    const labels = tabButtons.map((b) => b.textContent);
    expect(labels.some((t) => /itinerary/i.test(t))).toBe(true);
    expect(labels.some((t) => /map/i.test(t))).toBe(true);
    expect(labels.some((t) => /packing/i.test(t))).toBe(true);
    expect(labels.some((t) => /vote/i.test(t))).toBe(true);
  });

  it('tab bar wrapper has overflow-hidden to clip any OS-level bleed-through', () => {
    render(<App />);
    const wrapper = screen.getByTestId('tab-bar-wrapper');
    expect(wrapper.className).toContain('overflow-hidden');
  });
});
