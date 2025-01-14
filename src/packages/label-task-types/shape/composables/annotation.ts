import type { ComputedRef } from 'vue'
import type { AnnotationShape } from '../types'
import { AnnotationType } from '~/stores/annotation'
import { useAnnotations as useBaseAnnotations } from '../../composables/annotation'

/**
 * The wrapped annotation store that exposes
 * the relevant states and actions in the global annotation store.
 * Return the annotations and categories of the given annotation type.
 */
export const useAnnotations = () => {
  const results = useBaseAnnotations(AnnotationType.Shape)
  const annotations = results.annotations as ComputedRef<AnnotationShape[]>
  return { ...results, annotations }
}
