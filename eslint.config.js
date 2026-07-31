import antfu from '@antfu/eslint-config'

export default antfu(
  {
    vue: true,
    typescript: true,
    ignores: [
      'src/**/*.json',
      'shims.d.ts',
      'onelabeler.d.ts',
      'test-results/**',
      'playwright-report/**',
      'blob-report/**',
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
