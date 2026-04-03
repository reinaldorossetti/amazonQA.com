import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './web/src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./web/src/__tests__/setup.js'],
    include: ['web/src/**/*.test.{js,jsx}', 'web/src/**/*.spec.{js,jsx}'],
    exclude: ['web/e2e/**', 'node_modules/**', 'dist/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov', 'text-summary'],
      lines: 80,
      functions: 80,
      branches: 80,
      statements: 80,
      include: ['web/src/**/*.{js,jsx}'],
      exclude: [
        'web/src/**/*.test.{js,jsx}',
        'web/src/**/__tests__',
        'web/src/main.jsx',
        'web/src/index.js',
      ],
    },
  },
});
