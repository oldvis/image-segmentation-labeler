import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { expect, test } from '@playwright/test'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const outPath = path.resolve(__dirname, '../docs/images/screenshot.png')
const sampleImage = path.resolve(__dirname, 'fixtures/readme-sample.jpg')

/**
 * Captures the annotate workspace for the README.
 * Run via: `pnpm docs:screenshot` (excluded from default e2e).
 *
 * Remote seed hosts are stubbed with the first Rumsey seed plate
 * (`e2e/fixtures/readme-sample.jpg`) so the shot stays reproducible offline.
 */
test('capture annotate overview for README', async ({ page }) => {
  test.setTimeout(60_000)
  await page.addInitScript(() => {
    window.localStorage.clear()
    window.sessionStorage.clear()
    window.localStorage.setItem('color-schema', 'light')
    window.localStorage.setItem('user', JSON.stringify({
      type: 'Reviewer',
      name: 'Reviewer',
      uuid: '11111111-1111-4111-8111-111111111111',
    }))
    window.localStorage.setItem('message', JSON.stringify({ messages: [] }))
  })
  await page.route('**/*.{jpg,jpeg,png,webp}', async (route) => {
    const url = route.request().url()
    if (url.includes('127.0.0.1') || url.includes('localhost')) {
      await route.continue()
      return
    }
    await route.fulfill({ path: sampleImage, contentType: 'image/jpeg' })
  })
  await page.route('https://media.davidrumsey.com/**', async (route) => {
    await route.fulfill({ path: sampleImage, contentType: 'image/jpeg' })
  })

  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')
  await page.getByTestId('chart-stage').waitFor({ state: 'visible', timeout: 30_000 })
  await page.locator('[data-testid="chart-stage"] canvas').first().waitFor({ state: 'visible' })
  await page.getByText('Hi, Reviewer').waitFor({ state: 'visible', timeout: 10_000 })
  await page.getByText('Objects', { exact: true }).waitFor({ state: 'visible' })

  // Drop seed annotator identities so the public README shot has no real names.
  // Playwright serializes this callback — keep the body free of TS syntax.
  await page.evaluate(`(() => {
    const el = document.querySelector('#app')
    const vueApp = el && el.__vue_app__
    const store = vueApp?.config?.globalProperties?.$pinia?._s?.get('annotation')
    if (!store) throw new Error('annotation store not found')
    store.annotations = store.annotations.map((d) => ({ ...d, user: null }))
  })()`)
  await expect(page.getByText('Last modified by')).toHaveCount(0)
  await new Promise((r) => setTimeout(r, 1500))

  await page.screenshot({
    path: outPath,
    type: 'png',
    animations: 'disabled',
  })
})
