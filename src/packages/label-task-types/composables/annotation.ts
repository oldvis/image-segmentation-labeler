import type { MaybeRef } from '@vueuse/core'
import type { Annotation, AnnotationType } from '~/stores/annotation'
import { storeToRefs } from 'pinia'
import { computed, unref } from 'vue'
import { useStore as useAnnotationStore } from '~/stores/annotation'

/**
 * The wrapped annotation store that exposes
 * the relevant states and actions in the global annotation store.
 * Return the annotations and categories of the given annotation type.
 */
export const useAnnotations = (annotationType: MaybeRef<AnnotationType>) => {
  const store = useAnnotationStore()
  const {
    annotations,
    categories,
    selectedAnnotations,
    selectedDataObjects,
    categoryToColor,
  } = storeToRefs(store)
  const selectedDataObjectUuids = computed(() => (
    new Set(selectedDataObjects.value.map((d) => d.uuid))
  ))

  // The annotations assigned to the currently selected data objects
  // with the given annotation type.
  const annotationsFiltered = computed(() => (
    annotations.value
      .filter((d) => (selectedDataObjectUuids.value.has(d.subject)))
      .filter((d) => d.type === unref(annotationType))
  ))

  // The categories relevant to the given annotation type.
  const categoriesFiltered = computed(() => (
    categories.value
      .filter((d) => d.tasks.includes(unref(annotationType)))
      .map((d) => d.value)
  ))

  // Check if an annotation is selected.
  const isSelected = (annotation: Annotation): boolean => (
    selectedAnnotations.value.find((d) => d.uuid === annotation.uuid) !== undefined
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
