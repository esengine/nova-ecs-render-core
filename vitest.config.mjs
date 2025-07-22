import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Enable global test APIs (describe, test, expect, etc.)
    globals: true,

    // Use Node.js environment
    environment: 'node',

    // Test file patterns
    include: [
      'tests/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      'src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'
    ],

    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
      exclude: [
        'node_modules/',
        'dist/',
        'coverage/',
        '**/*.d.ts',
        'src/index.ts',
        'tests/',
        '*.config.*',
        'rollup.config.js'
      ],
      thresholds: {
        global: {
          branches: 75,
          functions: 75,
          lines: 75,
          statements: 75
        }
      }
    },

    // Test timeout
    testTimeout: 10000,

    // Reporter configuration
    reporters: ['verbose']
  },

  // Resolve configuration for better module resolution
  resolve: {
    alias: {
      '@': './src'
    }
  }
});
