import { ref, watch } from 'vue'
import type { Ref } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import { onKeyDown, useMagicKeys } from '@vueuse/core'
import type { Annotation } from '~/stores/annotation'

type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>

/**
 * Use the keyboard shortcuts.
 * @param annotations The annotations.
 * @param selectedAnnotationUuids The uuids of selected annotations.
 * @param add The function to add annotation to the annotation store.
 * @param select The function to select an annotation in the annotation store.
 * @param removeBulk The function to remove annotations in the annotation store.
 */
const useKeyboard = (
  annotations: Ref<Annotation[]>,
  selectedAnnotationUuids: Ref<string[]>,
  add: (d: Optional<Annotation, 'uuid' | 'user' | 'time'>) => void,
  select: (d: Annotation | null) => void,
  removeBulk: (uuids: string[]) => void,
) => {
  // On key down x.
  onKeyDown('Delete', () => {
    // Remove selected annotation and clear selection.
    removeBulk(selectedAnnotationUuids.value)
    select(null)
  })

  const copiedAnnotationUuids = ref([] as string[])
  const { Ctrl_C, Ctrl_V } = useMagicKeys()

  // On key down ctrl + c.
  watch(Ctrl_C, (v) => {
    if (!v) return
    copiedAnnotationUuids.value = selectedAnnotationUuids.value
  })

  // On key down ctrl + v.
  watch(Ctrl_V, (v) => {
    if (!v) return
    copiedAnnotationUuids.value.forEach((uuid) => {
      const annotation = annotations.value.find((d) => d.uuid === uuid)
      if (annotation === undefined) return
      const newAnnotation: Annotation = {
        ...JSON.parse(JSON.stringify(annotation)),
        uuid: uuidv4(),
      }
      add(newAnnotation)
      select(newAnnotation)
    })
  })
}

export default useKeyboard
