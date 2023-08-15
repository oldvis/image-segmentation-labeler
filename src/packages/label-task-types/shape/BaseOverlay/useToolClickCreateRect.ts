import { computed, unref, watch } from 'vue'
import type { Component, Ref } from 'vue'
import Konva from 'konva'
import type { MaybeRef } from '@vueuse/core'
import { ShapeType } from '../types'
import { AnnotationType } from '~/stores/annotation'
import type { Annotation, DataObject } from '~/stores/annotation'

type Point = [number, number]
type VueKonvaLayer = Component & { getNode: () => Konva.Layer }

const getBBox = (points: Point[]): {
  xMin: number
  xMax: number
  yMin: number
  yMax: number
} => {
  const xMin = Math.min(...points.map((d) => d[0]))
  const xMax = Math.max(...points.map((d) => d[0]))
  const yMin = Math.min(...points.map((d) => d[1]))
  const yMax = Math.max(...points.map((d) => d[1]))
  return { xMin, xMax, yMin, yMax }
}

/**
 * Use the ClickCreateRect tool's effect on the data store.
 * @param points The points (list of <x, y>) of (partially) created shape annotation.
 * @param category The category of the shape annotation.
 * @param dataObject The data object to which the shape annotation is attached.
 * @param add The function to add annotation to the annotation store.
 * @param enabled Whether the tool is enabled.
 */
const useDateEffect = (
  points: Ref<Point[]>,
  category: Ref<string | null>,
  dataObject: Ref<DataObject>,
  add: (d: Omit<Annotation, 'uuid' | 'user' | 'time'>) => void,
  enabled: MaybeRef<boolean> = true,
) => {
  // Finish rect creation when two points are created.
  watch(points, () => {
    if (!unref(enabled)) return
    if (points.value.length > 2) throw new Error('points length > 2 when creating rect')
    if (category.value === null || points.value.length !== 2) return
    const { xMin, xMax, yMin, yMax } = getBBox(points.value)
    add({
      type: AnnotationType.Shape,
      subject: dataObject.value.uuid,
      value: {
        category: category.value,
        shape: ShapeType.Rect,
        points: [[xMin, yMin], [xMin, yMax], [xMax, yMax], [xMax, yMin]]
          .map((d) => [Math.round(d[0]), Math.round(d[1])]),
      },
    })
    points.value = []
  })
}

/**
 * Use the ClickCreateRect tool's effect on the interface.
 * @param points The points (list of <x, y>) of (partially) created shape annotation.
 * @param mouse The current mouse position <x, y>.
 * @param color The color of the shape to be created
 * @param layer The Konva layer to show the effect.
 * @param enabled Whether the tool is enabled.
 * @param strokeWidth The stroke width of the shape shown in the interface.
 */
export const useVisualEffect = (
  points: Ref<Point[]>,
  mouse: Ref<Point | null>,
  color: Ref<string | null>,
  layer: Ref<VueKonvaLayer | undefined>,
  enabled: MaybeRef<boolean> = true,
  strokeWidth: MaybeRef<number> = 5,
) => {
  // The rectangle formed by
  // the current mouse position and the previous point.
  const ACTIVE_RECT_ID = 'active-rect'
  const activeRectConfig = computed((): Konva.RectConfig | null => {
    if (
      !unref(enabled)
      || mouse.value === null
      || color.value === null
      || points.value.length !== 1
    ) return null
    const { xMin, xMax, yMin, yMax } = getBBox([points.value[0], mouse.value])
    return {
      id: ACTIVE_RECT_ID,
      x: xMin,
      y: yMin,
      width: xMax - xMin,
      height: yMax - yMin,
      stroke: color.value,
      strokeWidth: unref(strokeWidth),
      opacity: 0.5,
    }
  })
  watch(activeRectConfig, () => {
    // Note: because of Vue Konva's bug
    // v-rect node is not reactive in template.
    // Thus we manually update the rect with watch.
    const node = layer.value?.getNode()
    if (node === undefined) return
    node.find(`#${ACTIVE_RECT_ID}`).forEach((d) => d.destroy())
    if (activeRectConfig.value === null) return
    node.add(new Konva.Rect(activeRectConfig.value))
  })
}

/**
 * Use the ClickCreateRect tool.
 * @param points The points (list of <x, y>) of (partially) created shape annotation.
 * @param category The category of the shape annotation.
 * @param dataObject The data object to which the shape annotation is attached.
 * @param add The function to add annotation to the annotation store.
 * @param mouse The current mouse position <x, y>.
 * @param color The color of the shape to be created
 * @param layer The Konva layer to show the effect.
 * @param enabled Whether the tool is enabled.
 * @param strokeWidth The stroke width of the shape shown in the interface.
 */
const useTool = (
  points: Ref<Point[]>,
  category: Ref<string | null>,
  dataObject: Ref<DataObject>,
  add: (d: Omit<Annotation, 'uuid' | 'user' | 'time'>) => void,
  mouse: Ref<Point | null>,
  color: Ref<string | null>,
  layer: Ref<VueKonvaLayer | undefined>,
  enabled: MaybeRef<boolean> = true,
  strokeWidth: MaybeRef<number> = 5,
) => {
  useDateEffect(points, category, dataObject, add, enabled)
  useVisualEffect(points, mouse, color, layer, enabled, strokeWidth)
}

export default useTool
