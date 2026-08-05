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
 * Reset Pinia-related storage (user identity; annotation store is not persisted).
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

interface Store {
  dataObjects: Array<{ uuid: string }>
  selectedDataObjects: Array<{ uuid: string }>
  selectedAnnotations: unknown[]
  annotations: Array<{ type: string, subject: string, value?: unknown }>
  setAnnotations: (next: unknown[]) => void
}

/** Multilabel tag values for the currently selected entry. */
export const multilabelValuesForSelected = async (page: Page): Promise<string[]> => {
  return page.evaluate(() => {
    const root = document.querySelector('#app') as HTMLElement & {
      __vue_app__?: {
        config: { globalProperties: { $pinia: { _s: Map<string, Store> } } }
      }
    }
    const store = root.__vue_app__?.config.globalProperties.$pinia._s.get('annotation')
    if (store === undefined) throw new Error('annotation store not found')
    const subject = store.selectedDataObjects[0]?.uuid
    if (subject === undefined) return []
    const ml = store.annotations.find((d) => (
      d.type === 'MultilabelClassification' && d.subject === subject
    ))
    return Array.isArray(ml?.value) ? ml.value as string[] : []
  })
}

/**
 * Clear Chart annotations for the selected subject (empty stage for draw tests).
 */
export const clearSelectedSubjectCharts = async (page: Page): Promise<void> => {
  await page.evaluate(() => {
    const root = document.querySelector('#app') as HTMLElement & {
      __vue_app__?: {
        config: { globalProperties: { $pinia: { _s: Map<string, Store> } } }
      }
    }
    const store = root.__vue_app__?.config.globalProperties.$pinia._s.get('annotation')
    if (store === undefined) throw new Error('annotation store not found')
    const subject = store.selectedDataObjects[0]?.uuid ?? store.dataObjects[0]?.uuid
    if (subject === undefined) throw new Error('no subject')
    store.setAnnotations(store.annotations.filter((d) => !(
      d.type === 'Chart' && d.subject === subject
    )))
    store.selectedAnnotations = []
    store.selectedDataObjects = store.dataObjects.filter((d) => d.uuid === subject).slice(0, 1)
  })
}

/**
 * Inject a large synthetic Chart list onto non-selected subjects so Progress /
 * store hot paths are stressed without flooding the Objects panel for the
 * current image.
 */
export const injectSyntheticLargeAnnotations = async (
  page: Page,
  count = 12_000,
): Promise<void> => {
  await page.evaluate((n) => {
    const root = document.querySelector('#app') as HTMLElement & {
      __vue_app__?: {
        config: { globalProperties: { $pinia: { _s: Map<string, Store> } } }
      }
    }
    const store = root.__vue_app__?.config.globalProperties.$pinia._s.get('annotation')
    if (store === undefined) throw new Error('annotation store not found')
    const subjects = store.dataObjects.map((d) => d.uuid)
    const selected = store.selectedDataObjects[0]?.uuid ?? subjects[0]!
    const others = subjects.filter((uuid) => uuid !== selected)
    if (others.length === 0) throw new Error('need at least two data objects')

    const annotations: unknown[] = []
    for (let i = 0; i < n; i += 1) {
      annotations.push({
        type: 'Chart',
        uuid: `synth-chart-${i}`,
        subject: others[i % others.length],
        user: null,
        time: '2024-01-01T00:00:00.000Z',
        value: {
          shape: 'Rect',
          points: [[0, 0], [0, 1], [1, 1], [1, 0]],
          chart: { marks: [] },
        },
      })
    }
    store.setAnnotations(annotations)
    store.selectedDataObjects = store.dataObjects.filter((d) => d.uuid === selected).slice(0, 1)
  }, count)

  await page.getByTestId('progress-labeled-count').waitFor({ state: 'visible' })
}

/**
 * Click → tag `aria-pressed` flip (add or remove). User-perceived tag latency.
 */
export const measureTagToggleLatencyMs = async (
  page: Page,
  tag: string,
): Promise<number> => {
  const button = page.getByTestId(`tag-${tag}`)
  await button.waitFor({ state: 'visible' })
  return button.evaluate(async (el) => {
    const start = performance.now()
    const before = el.getAttribute('aria-pressed') ?? ''
    await new Promise<void>((resolve, reject) => {
      let settled = false
      let timer = 0
      let obs: MutationObserver
      const finish = (error?: Error): void => {
        if (settled) return
        settled = true
        window.clearTimeout(timer)
        obs.disconnect()
        if (error !== undefined) reject(error)
        else resolve()
      }
      obs = new MutationObserver(() => {
        if ((el.getAttribute('aria-pressed') ?? '') !== before) finish()
      })
      timer = window.setTimeout(() => {
        finish(new Error('Timed out waiting for aria-pressed change'))
      }, 30_000)
      obs.observe(el, { attributes: true, attributeFilter: ['aria-pressed'] })
      el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
    })
    return performance.now() - start
  })
}
