import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';

// Pin every `react` / `react-dom` import to the package-local copy so jsdom
// sees one React, not the root monorepo's stray React 18 install.
const reactDir = resolve(__dirname, 'node_modules/react');
const reactDomDir = resolve(__dirname, 'node_modules/react-dom');

export default defineConfig({
  plugins: [react()],
  resolve: {
    dedupe: ['react', 'react-dom'],
    alias: {
      react: reactDir,
      'react-dom': reactDomDir,
      'react/jsx-runtime': resolve(reactDir, 'jsx-runtime.js'),
      'react/jsx-dev-runtime': resolve(reactDir, 'jsx-dev-runtime.js'),
      'react-dom/client': resolve(reactDomDir, 'client.js'),
      'react-dom/test-utils': resolve(reactDomDir, 'test-utils.js'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    css: false,
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    setupFiles: ['./src/test/setup.ts'],
    server: {
      deps: {
        inline: ['@testing-library/react'],
      },
    },
  },
});
