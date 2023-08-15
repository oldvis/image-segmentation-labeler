import { computed, unref, watch } from 'vue'
import type { Component, Ref } from 'vue'
import Konva from 'konva'
import { onKeyStroke } from '@vueuse/core'
import type { MaybeRef } from '@vueuse/core'
import { ShapeType } from '../types'
import { AnnotationType } from '~/stores/annotation'
import type { Annotation, DataObject } from '~/stores/annotation'

type Point = [number, number]
type VueKonvaLayer = Component & { getNode: () => Konva.Layer }

/**
 * Use the ClickCreatePolygon tool's effect on the data store.
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
  // Finish polygon creation when key press enter.
  onKeyStroke('Enter', () => {
    if (!unref(enabled)) return
    if (category.value === null || points.value.length <= 2) return
    add({
      type: AnnotationType.Shape,
      subject: dataObject.value.uuid,
      value: {
        category: category.value,
        shape: ShapeType.Polygon,
        points: points.value.map((d) => [Math.round(d[0]), Math.round(d[1])]),
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
  // The polygon formed by
  // the current mouse position and the previous points.
  const ACTIVE_POLYGON_ID = 'active-polygon'
  const activePolygonConfig = computed((): Konva.LineConfig | null => {
    if (
      !unref(enabled)
      || mouse.value === null
      || color.value === null
      || points.value.length === 0
    ) return null
    return {
      id: ACTIVE_POLYGON_ID,
      points: [...points.value, mouse.value].flat(),
      stroke: color.value,
      strokeWidth: unref(strokeWidth),
      opacity: 0.5,
      closed: false,
    }
  })
  watch(activePolygonConfig, () => {
    // Note: because of Vue Konva's bug
    // v-line node is not reactive in template.
    // Thus we manually update the line with watch.
    const node = layer.value?.getNode()
    if (node === undefined) return
    node.find(`#${ACTIVE_POLYGON_ID}`).forEach((d) => d.destroy())
    if (activePolygonConfig.value === null) return
    node.add(new Konva.Line(activePolygonConfig.value))
  })

  // The polygon's closing edge formed by
  // the current mouse position and the first point.
  const ACTIVE_CLOSING_EDGE_ID = 'active-closing-edge'
  const activeClosingEdgeConfig = computed((): Konva.LineConfig | null => {
    if (
      !unref(enabled)
      || mouse.value === null
      || color.value === null
      || points.value.length <= 1
    ) return null
    return {
      id: ACTIVE_CLOSING_EDGE_ID,
      points: [mouse.value, points.value[0]].flat(),
      stroke: '#808080',
      strokeWidth: unref(strokeWidth),
      opacity: 0.5,
      closed: false,
    }
  })
  watch(activeClosingEdgeConfig, () => {
    // Note: because of Vue Konva's bug
    // v-line node is not reactive in template.
    // Thus we manually update the line with watch.
    const node = layer.value?.getNode()
    if (node === undefined) return
    node.find(`#${ACTIVE_CLOSING_EDGE_ID}`).forEach((d) => d.destroy())
    if (activeClosingEdgeConfig.value === null) return
    node.add(new Konva.Line(activeClosingEdgeConfig.value))
  })
}

/**
 * Use the ClickCreatePolygon tool.
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
