import { expect, test } from '@playwright/test'
import {
  injectSyntheticLargeAnnotations,
  measureTagToggleLatencyMs,
  openAnnotateApp,
} from './helpers/app'

/**
 * Regression guard for annotation hot-path latency with a synthetic large list.
 * Typical tag feedback should stay well under 50ms; threshold allows CI noise.
 */
const MAX_TAG_MS = 250
const SAMPLES = 3
const SYNTHETIC_ANNOTATIONS = 12_000

test.describe('label click latency', () => {
  test('keeps tag toggle feedback fast on a large annotation list', async ({ page }) => {
    test.setTimeout(300_000)
    await openAnnotateApp(page)
    await injectSyntheticLargeAnnotations(page, SYNTHETIC_ANNOTATIONS)

    // Warm-up (first paint / JIT); not scored.
    await measureTagToggleLatencyMs(page, 'Confident')

    const samples: number[] = []
    for (let i = 0; i < SAMPLES; i += 1) {
      samples.push(await measureTagToggleLatencyMs(page, 'Confident'))
    }

    const mean = samples.reduce((a, b) => a + b, 0) / samples.length
    // eslint-disable-next-line no-console
    console.log(
      `[e2e-label-latency] samples_ms=${samples.map((ms) => ms.toFixed(1)).join(',')} `
      + `mean_ms=${mean.toFixed(1)} max_ms=${MAX_TAG_MS} synthetic_n=${SYNTHETIC_ANNOTATIONS}`,
    )

    expect(mean).toBeLessThan(MAX_TAG_MS)
    for (const ms of samples) {
      expect(ms).toBeLessThan(MAX_TAG_MS)
    }
  })
})
