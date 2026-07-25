// Vitest setup — jsdom environment.
// We don't pull in @testing-library/jest-dom to keep the dep footprint small;
// the smoke tests assert against `getAttribute` / `tagName` directly.

class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

Object.defineProperty(globalThis, 'ResizeObserver', {
  configurable: true,
  writable: true,
  value: ResizeObserverStub,
});
