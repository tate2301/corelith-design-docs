// Vitest setup — jsdom environment.
// We don't pull in @testing-library/jest-dom to keep the dep footprint small;
// the smoke tests assert against `getAttribute` / `tagName` directly.
