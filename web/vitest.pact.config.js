import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['tests/pact/consumer/**/*.test.js'],
    exclude: ['node_modules/**', 'dist/**'],
    testTimeout: 30_000,
  },
});
