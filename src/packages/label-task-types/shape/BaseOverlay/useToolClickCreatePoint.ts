import type { MaybeRef } from '@vueuse/core'
import type { Ref } from 'vue'
import type { Annotation, DataObject } from '~/stores/annotation'
import { unref, watch } from 'vue'
import { AnnotationType } from '~/stores/annotation'
import { ShapeType } from '../types'

/**
 * Use the ClickCreatePoint tool.
 * @param points The points (list of <x, y>) of (partially) created shape annotation.
 * @param category The category of the shape annotation.
 * @param dataObject The data object to which the shape annotation is attached.
 * @param add The function to add annotation to the annotation store.
 * @param enabled Whether the tool is currently enabled.
 */
const useTool = (
  points: Ref<[number, number][]>,
  category: Ref<string | null>,
  dataObject: Ref<DataObject>,
  add: (d: Omit<Annotation, 'uuid' | 'user' | 'time'>) => void,
  enabled: MaybeRef<boolean> = true,
) => {
  // Finish point creation when one point is created.
  watch(points, () => {
    if (!unref(enabled)) return
    if (points.value.length > 1) throw new Error('points length > 1 when creating point')
    if (category.value === null || points.value.length !== 1) return
    add({
      type: AnnotationType.Shape,
      subject: dataObject.value.uuid,
      value: {
        category: category.value,
        shape: ShapeType.Point,
        points: points.value.map((d) => [Math.round(d[0]), Math.round(d[1])]),
      },
    })
    points.value = []
  })
}

export default useTool
