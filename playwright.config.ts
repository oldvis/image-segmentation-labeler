import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { defineConfig, devices } from '@playwright/test'

const PORT = 4173
const viteBin = path.join(path.dirname(fileURLToPath(import.meta.url)), 'node_modules', '.bin', 'vite')

// Avoid HTTP_PROXY intercepting Playwright's readiness check to localhost.
process.env.NO_PROXY = [process.env.NO_PROXY, '127.0.0.1,localhost,[::1]'].filter(Boolean).join(',')
process.env.no_proxy = process.env.NO_PROXY

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: `"${viteBin}" --host 127.0.0.1 --port ${PORT}`,
    url: `http://127.0.0.1:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
