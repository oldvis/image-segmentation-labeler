import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { useAnnotations } from '~/packages/label-task-types/composables/annotation'
import { AnnotationType, useStore as useAnnotationStore } from '~/stores/annotation'
import { makeChartAnnotation, makeDataObject, makeMultilabelAnnotation } from '../../../helpers/fixtures'

describe('useAnnotations', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('filters annotations by selected subject and type', () => {
    const store = useAnnotationStore()
    const img1 = makeDataObject('img-1')
    store.setAnnotations([
      makeChartAnnotation({ uuid: 'c1', subject: 'img-1' }),
      makeChartAnnotation({ uuid: 'c2', subject: 'img-2' }),
      makeMultilabelAnnotation({ uuid: 'm1', subject: 'img-1' }),
    ])
    store.selectedDataObjects = [img1]

    const { annotations, categories } = useAnnotations(AnnotationType.Chart)
    expect(annotations.value.map((d) => d.uuid)).toEqual(['c1'])
    expect(categories.value).toContain('Rect')
    expect(categories.value).not.toContain('Vis')
  })

  it('select / isSelected manage selectedAnnotations', () => {
    const store = useAnnotationStore()
    const ann = makeChartAnnotation({ uuid: 'c1', subject: 'img-1' })
    store.setAnnotations([ann])
    store.selectedDataObjects = [makeDataObject('img-1')]
    const api = useAnnotations(AnnotationType.Chart)

    api.select(ann)
    expect(api.isSelected(ann)).toBe(true)
    expect(store.selectedAnnotations).toEqual([ann])
    api.select(null)
    expect(store.selectedAnnotations).toEqual([])
  })
})
