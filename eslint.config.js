import antfu from '@antfu/eslint-config'

export default antfu(
  {
    unocss: true,
    // Requires eslint-plugin-format when true; keep off until that dep is added.
    formatters: false,
    pnpm: true,
    ignores: [
      'src/**/*.json',
      'e2e/fixtures/**',
      'shims.d.ts',
      'onelabeler.d.ts',
      'test-results/**',
      'playwright-report/**',
      'blob-report/**',
      'docs/**',
    ],
  },
  {
    files: [
      'src/**/*.{vue,ts}',
      'test/**/*.{ts,tsx}',
      'e2e/**/*.{ts,tsx}',
      'playwright.config.ts',
      'vite.config.ts',
    ],
    rules: {
      'arrow-parens': ['error', 'always'],
      'style/arrow-parens': ['error', 'always'],
      'curly': ['error', 'multi-line'],
      'antfu/if-newline': ['off'],
      'antfu/top-level-function': ['off'],
    },
  },
)
