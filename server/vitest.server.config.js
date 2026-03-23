import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/api/**/*.test.js'],
    exclude: ['node_modules/**', 'dist/**', '.next/**'],
    clearMocks: true,
    restoreMocks: true,
  },
});
