import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'primitives/index': 'src/primitives/index.ts',
    'blocks/index': 'src/blocks/index.ts',
    'shells/index': 'src/shells/index.ts',
    'patterns/index': 'src/patterns/index.ts',
  },
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  clean: true,
  external: ['react', 'react-dom'],
  treeshake: true,
  splitting: false,
  outDir: 'dist',
  // Copy CSS files alongside the JS so consumers can import them
  publicDir: 'src/styles',
});
