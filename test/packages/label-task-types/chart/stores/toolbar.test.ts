import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { ToolType, useStore } from '~/packages/label-task-types/chart/stores/toolbar'

describe('chart toolbar store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('defaults to ClickCreateRect and empty stroke', () => {
    const store = useStore()
    expect(store.tool).toBe(ToolType.ClickCreateRect)
    expect(store.stroke).toEqual([])
  })

  it('setStroke / setOperation update state', () => {
    const store = useStore()
    store.setStroke(['Rect'])
    store.setOperation(ToolType.ClickCreatePolygon)
    expect(store.stroke).toEqual(['Rect'])
    expect(store.tool).toBe(ToolType.ClickCreatePolygon)
  })
})
