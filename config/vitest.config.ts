import { fileURLToPath } from 'node:url'
import {
  configDefaults,
  coverageConfigDefaults,
  defineConfig,
} from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    environment: 'jsdom',
    setupFiles: [fileURLToPath(new URL('./vitest.setup.ts', import.meta.url))],
    globals: true,
    // server/ is its own workspace with its own Jest setup — run its tests
    // via `npm test --workspace server`, not the root Vitest config.
    exclude: [...configDefaults.exclude, 'server/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['components/**/*.{ts,tsx}'],
      exclude: [
        ...coverageConfigDefaults.exclude,
        'components/**/*.stories.tsx',
        '.storybook/**',
      ],
      thresholds: {
        lines: 80,
        branches: 80,
        functions: 80,
        statements: 80,
        perFile: true,
      },
    },
  },
})
