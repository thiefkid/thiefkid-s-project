import { render, screen } from '@testing-library/react';
import App from '../App.jsx';

/**
 * Tests that the bottom tab bar handles iOS safe area correctly
 * to prevent white space on devices like iPhone 13 Pro Max.
 */
describe('Bottom bar — safe area & white space fix', () => {
  it('tab bar wrapper uses bg-slate-50 (not white) to reduce visual dead space', () => {
    render(<App />);
    const wrapper = screen.getByTestId('tab-bar-wrapper');
    expect(wrapper.className).toContain('bg-slate-50');
    expect(wrapper.className).not.toContain('bg-white');
  });

  it('tab bar wrapper has border-slate-200 for a visible separator', () => {
    render(<App />);
    const wrapper = screen.getByTestId('tab-bar-wrapper');
    expect(wrapper.className).toContain('border-slate-200');
  });

  it('tab bar wrapper carries the env-safe-area padding strategy (JSDOM strips env())', () => {
    render(<App />);
    const wrapper = screen.getByTestId('tab-bar-wrapper');
    // JSDOM cannot evaluate env() so we verify via data attribute
    expect(wrapper.dataset.bottomPad).toBe('env-safe-area');
  });

  it('tab bar wrapper retains data-bottom-pad marker for safe-area strategy', () => {
    render(<App />);
    const wrapper = screen.getByTestId('tab-bar-wrapper');
    expect(wrapper.dataset.bottomPad).toBe('env-safe-area');
  });
});
