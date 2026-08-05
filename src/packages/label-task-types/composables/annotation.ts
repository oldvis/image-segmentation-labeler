import type { MaybeRef } from 'vue'
import type { Annotation, AnnotationType } from '~/stores/annotation'
import { storeToRefs } from 'pinia'
import { computed, unref } from 'vue'
import { useStore as useAnnotationStore } from '~/stores/annotation'

/**
 * The wrapped annotation store that exposes
 * the relevant states and actions in the global annotation store.
 * Return the annotations and categories of the given annotation type.
 *
 * Filters via per-subject index (not a full-list scan) so Objects / tools
 * stay fast when the flat export list is large.
 */
export const useAnnotations = (annotationType: MaybeRef<AnnotationType>) => {
  const store = useAnnotationStore()
  const {
    annotationsBySubject,
    categories,
    selectedAnnotations,
    selectedDataObjects,
    categoryToColor,
  } = storeToRefs(store)

  // The annotations assigned to the currently selected data objects
  // with the given annotation type.
  const annotationsFiltered = computed(() => {
    const type = unref(annotationType)
    const out: Annotation[] = []
    for (const dataObject of selectedDataObjects.value) {
      const rows = annotationsBySubject.value[dataObject.uuid]
      if (rows === undefined) continue
      for (const annotation of rows) {
        if (annotation.type === type) out.push(annotation)
      }
    }
    return out
  })

  // The categories relevant to the given annotation type.
  const categoriesFiltered = computed(() => (
    categories.value
      .filter((d) => d.tasks.includes(unref(annotationType)))
      .map((d) => d.value)
  ))

  // Check if an annotation is selected.
  const isSelected = (annotation: Annotation): boolean => (
    selectedAnnotations.value.some((d) => d.uuid === annotation.uuid)
  )

  // Select an annotation.
  const select = (annotation: Annotation | null): void => {
    store.selectedAnnotations = annotation === null ? [] : [annotation]
  }

  return {
    annotations: annotationsFiltered,
    categories: categoriesFiltered,
    categoryToColor,
    isSelected,
    select,
    add: store.add,
    update: store.update,
    remove: store.remove,
    removeBulk: store.removeBulk,
  }
}
