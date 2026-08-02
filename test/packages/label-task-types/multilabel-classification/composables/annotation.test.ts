import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { useAnnotations } from '~/packages/label-task-types/multilabel-classification/composables/annotation'
import { useStore as useAnnotationStore } from '~/stores/annotation'
import { makeDataObject, makeMultilabelAnnotation } from '../../../../helpers/fixtures'

describe('multilabel useAnnotations', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('exposes current dataObject and multilabel annotation', () => {
    const store = useAnnotationStore()
    store.selectedDataObjects = [makeDataObject('img-1')]
    store.annotations = [makeMultilabelAnnotation({ uuid: 'm1', subject: 'img-1', value: ['Vis'] })]
    const { dataObject, multilabel, categories } = useAnnotations()
    expect(dataObject.value?.uuid).toBe('img-1')
    expect(multilabel.value?.uuid).toBe('m1')
    expect(categories.value).toEqual(expect.arrayContaining(['Vis', 'Not Vis', 'Confident', 'Unconfident']))
  })

  it('throws when more than one data object is selected', () => {
    const store = useAnnotationStore()
    store.selectedDataObjects = [makeDataObject('img-1'), makeDataObject('img-2')]
    const { dataObject } = useAnnotations()
    expect(() => dataObject.value).toThrow(/more than one data object/)
  })

  it('throws when more than one multilabel annotation exists for the subject', () => {
    const store = useAnnotationStore()
    store.selectedDataObjects = [makeDataObject('img-1')]
    store.annotations = [
      makeMultilabelAnnotation({ uuid: 'm-old', subject: 'img-1', value: ['Vis'] }),
      makeMultilabelAnnotation({ uuid: 'm-new', subject: 'img-1', value: ['Not Vis'] }),
    ]
    const { multilabel } = useAnnotations()
    expect(() => multilabel.value).toThrow(/more than one annotation/)
  })
})
