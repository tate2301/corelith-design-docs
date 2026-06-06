/**
 * Builds the IIFE bundle used by the Sandpack bridge.
 *
 *   dist/cdn.global.js   →   window.Corelith = { Button, Field, … }
 *
 * Ships React + ReactDOM externalised against the globals `React` and
 * `ReactDOM` (the bridge loads them from esm.sh first). CSS is *not*
 * inlined — the docs site already loads `components.css`, and Sandpack
 * snippets share that visual chrome through the iframe styles.
 */
import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'Corelith',
      formats: ['iife'],
      fileName: () => 'cdn.global.js',
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime', 'react-dom/client'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'react/jsx-runtime': 'jsxRuntime',
          'react-dom/client': 'ReactDOMClient',
        },
        extend: true,
      },
    },
    emptyOutDir: false,
    sourcemap: false,
    cssCodeSplit: false,
  },
});
