import type { Page } from '@playwright/test'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const tinyPng = path.resolve(__dirname, '../fixtures/tiny.png')

/** Stub remote image fetches with a local PNG. */
export const stubRemoteImages = async (page: Page): Promise<void> => {
  await page.route('**/*.{jpg,jpeg,png,webp}', async (route) => {
    const url = route.request().url()
    if (url.includes('127.0.0.1') || url.includes('localhost')) {
      await route.continue()
      return
    }
    await route.fulfill({ path: tinyPng, contentType: 'image/png' })
  })
  await page.route('https://media.davidrumsey.com/**', async (route) => {
    await route.fulfill({ path: tinyPng, contentType: 'image/png' })
  })
}

/**
 * Reset persisted Pinia state.
 * Pre-sign-in so `useSignInNotice` does not mount a toast that intercepts clicks
 * (toast close control is icon-only and often zero-sized when icon fonts fail).
 */
export const clearAppStorage = async (page: Page): Promise<void> => {
  await page.addInitScript(() => {
    window.localStorage.clear()
    window.sessionStorage.clear()
    window.localStorage.setItem('user', JSON.stringify({
      type: 'Reviewer',
      name: 'e2e',
      uuid: '11111111-1111-4111-8111-111111111111',
    }))
    window.localStorage.setItem('message', JSON.stringify({ messages: [] }))
  })
}

const expectSignedIn = async (page: Page): Promise<void> => {
  await page.getByText('Hi, e2e').waitFor({ state: 'visible', timeout: 10_000 })
}

export const openAnnotateApp = async (page: Page): Promise<void> => {
  await clearAppStorage(page)
  await stubRemoteImages(page)
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')
  await page.getByTestId('chart-stage').waitFor({ state: 'visible' })
  await page.locator('[data-testid="chart-stage"] canvas').first().waitFor({ state: 'visible' })
  await expectSignedIn(page)
}
