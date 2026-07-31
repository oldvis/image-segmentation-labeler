import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { useAnnotations } from '~/packages/label-task-types/chart/composables/annotation'

describe('chart useAnnotations categoriesToColor', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('returns gray / category color / black by category count', () => {
    const { categoriesToColor, categoryToColor } = useAnnotations()
    expect(categoriesToColor.value([])).toBe('gray')
    expect(categoriesToColor.value(['Rect'])).toBe(categoryToColor.value('Rect'))
    expect(categoriesToColor.value(['Rect', 'Line'])).toBe('black')
  })
})
