// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from 'eslint-plugin-storybook'
import prettier from 'eslint-config-prettier'
import jsxA11y from 'eslint-plugin-jsx-a11y'

import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    'coverage/**',
    // server/ is its own workspace with its own eslint config — lint it via
    // `npm run lint --workspace server`, not the root Next.js config.
    'server/**',
    // Untracked output from the design-handoff extraction tool, not source
    // this repo maintains.
    'designs/extracted/**',
  ]),
  // eslint-config-next enables only 6 jsx-a11y rules, as warnings. WCAG AA is
  // a requirement here, so apply the full strict preset. Rules only: the
  // plugin itself is already registered by eslint-config-next.
  {
    files: ['**/*.{js,jsx,mjs,ts,tsx,mts}'],
    rules: jsxA11y.flatConfigs.strict.rules,
  },
  ...storybook.configs['flat/recommended'],
  prettier,
])

export default eslintConfig
