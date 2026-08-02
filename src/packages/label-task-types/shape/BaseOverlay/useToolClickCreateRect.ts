import type { Component, MaybeRef, Ref } from 'vue'
import type { AnnotationCreate, ImageDataObject } from '~/stores/annotation'
import type { Point } from '~/utils/geometry'
import Konva from 'konva'
import { computed, unref, watch } from 'vue'
import { AnnotationType } from '~/stores/annotation'
import { getBBox } from '~/utils/geometry'
import { ShapeType } from '../types'

type VueKonvaLayer = Component & { getNode: () => Konva.Layer }

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
  dataObject: Ref<ImageDataObject>,
  add: (d: AnnotationCreate) => void,
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
        points: [
          [Math.round(xMin), Math.round(yMin)],
          [Math.round(xMin), Math.round(yMax)],
          [Math.round(xMax), Math.round(yMax)],
          [Math.round(xMax), Math.round(yMin)],
        ],
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
    ) {
      return null
    }
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
  dataObject: Ref<ImageDataObject>,
  add: (d: AnnotationCreate) => void,
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
