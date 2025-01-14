import type { MaybeRef } from '@vueuse/core'
import type { Ref } from 'vue'
import type { Annotation, DataObject } from '~/stores/annotation'
import { unref, watch } from 'vue'
import { AnnotationType } from '~/stores/annotation'
import { ShapeType } from '../../shape'
import { SchemaType } from '../types'

type Point = [number, number]

/**
 * Use the ClickCreatePoint tool.
 * @param points The points (list of <x, y>) of (partially) created shape annotation.
 * @param categories The categories of the shape annotation.
 * @param dataObject The data object to which the shape annotation is attached.
 * @param add The function to add annotation to the annotation store.
 * @param enabled Whether the tool is currently enabled.
 */
const useTool = (
  points: Ref<Point[]>,
  categories: Ref<string[]>,
  dataObject: Ref<DataObject>,
  add: (d: Omit<Annotation, 'uuid' | 'user' | 'time'>) => void,
  enabled: MaybeRef<boolean> = true,
) => {
  // Finish point creation when one point is created.
  watch(points, () => {
    if (!unref(enabled)) return
    if (points.value.length > 1) throw new Error('points length > 1 when creating point')
    if (categories.value.length === 0 || points.value.length !== 1) return
    add({
      type: AnnotationType.Chart,
      subject: dataObject.value.uuid,
      value: {
        shape: ShapeType.Point,
        points: points.value.map((d) => [Math.round(d[0]), Math.round(d[1])]),
        chart: {
          marks: categories.value.map((d) => ({
            schema: SchemaType.Tabular,
            type: d,
            encode: {},
          })),
        },
      },
    })
    points.value = []
  })
}

export default useTool
