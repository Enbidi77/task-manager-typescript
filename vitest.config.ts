import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    testTimeout: 20000,
    passWithNoTests: true,
    include: ['test/**/*.test.{ts,tsx}', 'tests/**/*.test.{ts,tsx}'],
  },
});
