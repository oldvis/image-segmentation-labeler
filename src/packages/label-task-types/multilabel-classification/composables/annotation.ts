import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import type { AnnotationMultilabelClassification } from '../types'
import { useAnnotations as useBaseAnnotations } from '../../composables/annotation'
import { AnnotationType, useStore as useAnnotationStore } from '~/stores/annotation'
import type { DataObject } from '~/stores/annotation'

/**
 * The wrapped annotation store that exposes
 * the relevant states and actions in the global annotation store.
 */
export const useAnnotations = () => {
  const results = useBaseAnnotations(AnnotationType.MultilabelClassification)
  const { annotations } = results
  const store = useAnnotationStore()
  const { selectedDataObjects } = storeToRefs(store)

  // The current data object.
  const dataObject = computed((): DataObject | null => {
    if (selectedDataObjects.value.length >= 2) throw new Error('more than one data object selected')
    if (selectedDataObjects.value.length === 1) return selectedDataObjects.value[0]
    return null
  })

  // The current data object's multi-label classification.
  const multilabel = computed(() => {
    if (annotations.value.length >= 2) throw new Error('more than one annotation assigned to the data object')
    if (annotations.value.length === 1) {
      return annotations.value[0] as AnnotationMultilabelClassification
    }
    return null
  })

  return {
    ...results,
    dataObject,
    multilabel,
  }
}
