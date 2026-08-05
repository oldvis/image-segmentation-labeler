import { expect, test } from '@playwright/test'
import {
  clearSelectedSubjectCharts,
  multilabelValuesForSelected,
  openAnnotateApp,
} from './helpers/app'

test.describe('annotate smokes', () => {
  test('loads annotate view with image overlay canvas', async ({ page }) => {
    await openAnnotateApp(page)
    await expect(page.getByText('Draw', { exact: true })).toBeVisible()
    await expect(page.getByText('Objects', { exact: true })).toBeVisible()
    await expect(page.getByText('Progress')).toBeVisible()
    await expect(page.locator('[data-testid="chart-stage"] canvas').first()).toBeVisible()
  })

  test('drawing a bounding box adds a span card', async ({ page }) => {
    await openAnnotateApp(page)

    const spans = page.getByTestId('span-card')
    // Seed data already includes spans; clear them so clicks hit the empty stage
    // (ClickCreateRect only records the first point when the stage itself is the target).
    await clearSelectedSubjectCharts(page)
    await expect(spans).toHaveCount(0)

    const stage = page.getByTestId('chart-stage')
    const box = await stage.boundingBox()
    if (!box) throw new Error('chart-stage has no bounding box')

    await page.mouse.click(box.x + box.width * 0.25, box.y + box.height * 0.25)
    await page.mouse.click(box.x + box.width * 0.55, box.y + box.height * 0.55)

    await expect.poll(async () => spans.count()).toBe(1)
    await expect(spans.first()).toContainText('Shape Rect')
  })

  test('toggling multilabel tags selects Vis', async ({ page }) => {
    await openAnnotateApp(page)
    // Seed already includes Vis for the first image; toggle off then on.
    // Use testid — accessible name is the tip string, not "Vis".
    const vis = page.getByTestId('tag-Vis')
    await expect.poll(async () => multilabelValuesForSelected(page)).toContain('Vis')

    await vis.click()
    await expect.poll(async () => multilabelValuesForSelected(page)).not.toContain('Vis')

    await vis.click()
    await expect.poll(async () => multilabelValuesForSelected(page)).toContain('Vis')
  })

  test('next entry advances without inventing labeled status', async ({ page }) => {
    await openAnnotateApp(page)
    const labeled = page.getByTestId('progress-labeled-count')
    const before = Number(await labeled.textContent())
    // Seed data already has detections/tags on almost all entries.
    expect(before).toBeGreaterThan(0)

    await page.getByTestId('nav-next').click()

    await expect(labeled).toHaveText(String(before))
    await expect(page.getByTestId('nav-previous')).toBeEnabled()
  })

  test('download exports annotation.json', async ({ page }) => {
    await openAnnotateApp(page)
    const downloadPromise = page.waitForEvent('download')
    await page.getByTestId('annotations-download').click()
    const download = await downloadPromise
    expect(download.suggestedFilename()).toBe('annotation.json')

    const fail = await download.failure()
    expect(fail).toBeNull()
  })
})
