import type { ComputedRef } from 'vue'
import type { AnnotationChart } from '../types'
import { computed } from 'vue'
import { AnnotationType } from '~/stores/annotation'
import { useAnnotations as useBaseAnnotations } from '../../composables/annotation'

/**
 * The wrapped annotation store that exposes
 * the relevant states and actions in the global annotation store.
 * Return the annotations and categories of the given annotation type.
 */
export const useAnnotations = () => {
  const results = useBaseAnnotations(AnnotationType.Chart)
  const annotations = results.annotations as ComputedRef<AnnotationChart[]>
  const { categoryToColor } = results
  const categoriesToColor = computed(() => (categories: string[]): string => {
    if (categories.length === 0) return 'gray'
    if (categories.length >= 2) return 'black'
    return categoryToColor.value(categories[0])
  })
  return { ...results, annotations, categoriesToColor }
}
