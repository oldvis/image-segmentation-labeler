import type { ComputedRef } from 'vue'
import type { AnnotationMultilabelClassification } from '../types'
import type { ImageDataObject } from '~/stores/annotation'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import { AnnotationType, useStore as useAnnotationStore } from '~/stores/annotation'
import { useAnnotations as useBaseAnnotations } from '../../composables/annotation'

/**
 * The wrapped annotation store that exposes
 * the relevant states and actions in the global annotation store.
 */
export const useAnnotations = () => {
  const results = useBaseAnnotations(AnnotationType.MultilabelClassification)
  // Base already filters by MultilabelClassification; cast narrows Annotation.
  const annotations = results.annotations as ComputedRef<AnnotationMultilabelClassification[]>
  const store = useAnnotationStore()
  const { selectedDataObjects } = storeToRefs(store)

  // The current data object.
  const dataObject = computed((): ImageDataObject | null => {
    if (selectedDataObjects.value.length >= 2) throw new Error('more than one data object selected')
    if (selectedDataObjects.value.length === 1) return selectedDataObjects.value[0]
    return null
  })

  // The current data object's multi-label classification.
  const multilabel = computed((): AnnotationMultilabelClassification | null => {
    if (annotations.value.length >= 2) throw new Error('more than one annotation assigned to the data object')
    if (annotations.value.length === 1) {
      return annotations.value[0]
    }
    return null
  })

  return {
    ...results,
    dataObject,
    multilabel,
  }
}
