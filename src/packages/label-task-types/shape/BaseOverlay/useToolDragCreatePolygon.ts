import type { MaybeRef } from '@vueuse/core'
import type Konva from 'konva'
import type { Component, Ref } from 'vue'
import type { Annotation, DataObject } from '~/stores/annotation'
import { useMousePressed } from '@vueuse/core'
import { unref, watch } from 'vue'
import { AnnotationType } from '~/stores/annotation'
import { ShapeType } from '../types'
import simplify from './simplify'
import { useVisualEffect } from './useToolClickCreatePolygon'

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
  // Finish polygon creation when mouse release.
  const { pressed } = useMousePressed()
  watch(pressed, (newValue, oldValue) => {
    if (!unref(enabled)) return
    if (category.value === null || points.value.length <= 2) return

    // When mouse release (i.e., from pressed to not-pressed)
    const isMouseRelease = newValue === false && oldValue === true
    if (!isMouseRelease) return

    // Simplify the contour.
    const pts = simplify(
      points.value.map((d) => [Math.round(d[0]), Math.round(d[1])]),
      0,
      false,
    )
    if (pts.length <= 3) {
      points.value = []
      return
    }

    add({
      type: AnnotationType.Shape,
      subject: dataObject.value.uuid,
      value: {
        category: category.value,
        shape: ShapeType.Polygon,
        points: pts,
      },
    })
    points.value = []
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
