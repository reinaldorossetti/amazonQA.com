import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      '@pact-foundation/pact': path.resolve(__dirname, 'node_modules/@pact-foundation/pact'),
    },
  },
  server: {
    fs: {
      allow: ['..'],
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['../tests/pact/consumer/**/*.test.js'],
    exclude: ['node_modules/**', 'dist/**'],
    testTimeout: 30_000,
  },
});
