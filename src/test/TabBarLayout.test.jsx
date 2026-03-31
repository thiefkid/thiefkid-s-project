import { render } from '@testing-library/react';
import App from '../App.jsx';

// Helpers -----------------------------------------------------------------

function mockMatchMedia(standaloneMatches) {
  window.matchMedia = vi.fn((query) => ({
    matches: query === '(display-mode: standalone)' ? standaloneMatches : false,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
}

function setNavigatorStandalone(value) {
  Object.defineProperty(window.navigator, 'standalone', {
    value,
    configurable: true,
    writable: true,
  });
}

function setInnerHeight(px) {
  Object.defineProperty(window, 'innerHeight', {
    value: px,
    configurable: true,
    writable: true,
  });
}

afterEach(() => {
  // Reset to undefined so next test starts clean
  setNavigatorStandalone(undefined);
});

// Tests -------------------------------------------------------------------
// Note: JSDOM rejects env() in inline styles (returns ''), so we assert on
// the data-standalone attribute instead of paddingBottom directly.
// The production behaviour (env() padding) is correct — only JSDOM can't
// evaluate CSS environment variables.

describe('Tab bar layout — iPhone 13 Pro Max PWA vs browser', () => {
  it('browser mode: tab bar is NOT in standalone mode (no phantom toolbar pad)', () => {
    mockMatchMedia(false);
    setNavigatorStandalone(false);

    const { getByTestId } = render(<App />);
    expect(getByTestId('tab-bar-wrapper').dataset.standalone).toBe('false');
  });

  it('PWA via display-mode:standalone (matchMedia): tab bar IS in standalone mode', () => {
    mockMatchMedia(true);
    setNavigatorStandalone(false);

    const { getByTestId } = render(<App />);
    expect(getByTestId('tab-bar-wrapper').dataset.standalone).toBe('true');
  });

  it('iOS PWA via navigator.standalone=true: tab bar IS in standalone even if matchMedia is false', () => {
    mockMatchMedia(false);
    setNavigatorStandalone(true);

    const { getByTestId } = render(<App />);
    expect(getByTestId('tab-bar-wrapper').dataset.standalone).toBe('true');
  });

  it('app root height equals window.innerHeight to eliminate phantom toolbar in dvh', () => {
    mockMatchMedia(false);
    setInnerHeight(844); // iPhone 13 Pro Max visible height in browser

    const { container } = render(<App />);
    expect(container.firstChild.style.height).toBe('844px');
  });

  it('standalone PWA: app height equals window.innerHeight (full screen, no phantom space)', () => {
    mockMatchMedia(true);
    setInnerHeight(926); // iPhone 13 Pro Max full height in PWA

    const { container } = render(<App />);
    expect(container.firstChild.style.height).toBe('926px');
  });
});
