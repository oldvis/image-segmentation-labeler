import { expect, test } from '@playwright/test'
import { openAnnotateApp } from './helpers/app'

const multilabelValuesForSelected = async (page: import('@playwright/test').Page): Promise<string[]> => {
  return page.evaluate(() => {
    const raw = window.localStorage.getItem('annotation')
    if (!raw) return []
    const ann = JSON.parse(raw) as {
      selectedDataObjects: Array<{ uuid: string }>
      annotations: Array<{ type: string, subject: string, value: string[] }>
    }
    const subject = ann.selectedDataObjects[0]?.uuid
    if (!subject) return []
    const ml = ann.annotations.find((d) => (
      d.type === 'MultilabelClassification' && d.subject === subject
    ))
    return ml?.value ?? []
  })
}

test.describe('annotate smokes', () => {
  test('loads annotate view with image overlay canvas', async ({ page }) => {
    await openAnnotateApp(page)
    await expect(page.getByText('Tools')).toBeVisible()
    await expect(page.getByText('Spans')).toBeVisible()
    await expect(page.getByText('Progress')).toBeVisible()
    await expect(page.locator('[data-testid="chart-stage"] canvas').first()).toBeVisible()
  })

  test('drawing a bounding box adds a span card', async ({ page }) => {
    await openAnnotateApp(page)

    const spans = page.getByTestId('span-card')
    // Seed data already includes spans; clear them so clicks hit the empty stage
    // (ClickCreateRect only records the first point when the stage itself is the target).
    // Build a cleared annotation snapshot, then force it via initScript after reload
    // (Pinia may overwrite localStorage during page unload).
    const payload = await page.evaluate(() => {
      const raw = window.localStorage.getItem('annotation')
      if (!raw) return null
      const ann = JSON.parse(raw) as {
        dataObjects: Array<{ uuid: string }>
        selectedDataObjects: Array<{ uuid: string }>
        selectedAnnotations: unknown[]
        annotations: Array<{ type: string, subject: string }>
      }
      const subject = ann.selectedDataObjects[0]?.uuid ?? ann.dataObjects[0]?.uuid
      ann.annotations = ann.annotations.filter((d) => !(
        d.type === 'Chart' && d.subject === subject
      ))
      ann.selectedAnnotations = []
      // Keep current image selected after reload.
      ann.selectedDataObjects = ann.dataObjects.slice(0, 1)
      return JSON.stringify(ann)
    })
    expect(payload).toBeTruthy()

    await page.addInitScript((data) => {
      window.localStorage.setItem('annotation', data as string)
    }, payload)
    await page.reload()
    await page.getByTestId('chart-stage').waitFor({ state: 'visible' })
    await expect(spans).toHaveCount(0)

    const stage = page.getByTestId('chart-stage')
    const box = await stage.boundingBox()
    if (!box) throw new Error('chart-stage has no bounding box')

    await page.mouse.click(box.x + box.width * 0.25, box.y + box.height * 0.25)
    await page.mouse.click(box.x + box.width * 0.55, box.y + box.height * 0.55)

    await expect.poll(async () => spans.count()).toBe(1)
    await expect(spans.first()).toContainText('Rect')
  })

  test('toggling multilabel tags selects Vis', async ({ page }) => {
    await openAnnotateApp(page)
    // Seed already includes Vis for the first image; toggle off then on.
    const vis = page.getByRole('button', { name: 'Vis', exact: true })
    await expect.poll(async () => multilabelValuesForSelected(page)).toContain('Vis')

    await vis.click()
    await expect.poll(async () => multilabelValuesForSelected(page)).not.toContain('Vis')

    await vis.click()
    await expect.poll(async () => multilabelValuesForSelected(page)).toContain('Vis')
  })

  test('next entry marks current image labeled and advances', async ({ page }) => {
    await openAnnotateApp(page)
    const labeled = page.getByTestId('progress-labeled-count')
    const before = Number(await labeled.textContent())

    await page.getByTestId('nav-next').click()

    await expect(labeled).toHaveText(String(before + 1))
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
