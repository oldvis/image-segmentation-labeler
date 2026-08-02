import type Konva from 'konva'
import type { Component, MaybeRef, Ref } from 'vue'
import type { MarkType } from '../types'
import type { AnnotationCreate, ImageDataObject } from '~/stores/annotation'
import type { Point } from '~/utils/geometry'
import { unref, watch } from 'vue'
import { AnnotationType } from '~/stores/annotation'
import { getBBox } from '~/utils/geometry'
import { ShapeType } from '../../shape'
import { useVisualEffect } from '../../shape/BaseOverlay/useToolClickCreateRect'
import { SchemaType } from '../types'

type VueKonvaLayer = Component & { getNode: () => Konva.Layer }

/**
 * Use the ClickCreateRect tool's effect on the data store.
 * @param points The points (list of <x, y>) of (partially) created shape annotation.
 * @param categories The categories of the shape annotation.
 * @param dataObject The data object to which the shape annotation is attached.
 * @param add The function to add annotation to the annotation store.
 * @param enabled Whether the tool is enabled.
 */
const useDateEffect = (
  points: Ref<Point[]>,
  categories: Ref<MarkType[]>,
  dataObject: Ref<ImageDataObject>,
  add: (d: AnnotationCreate) => void,
  enabled: MaybeRef<boolean> = true,
) => {
  // Finish rect creation when two points are created.
  watch(points, () => {
    if (!unref(enabled)) return
    if (points.value.length > 2) throw new Error('points length > 2 when creating rect')
    if (categories.value.length === 0 || points.value.length !== 2) return
    const { xMin, xMax, yMin, yMax } = getBBox(points.value)
    add({
      type: AnnotationType.Chart,
      subject: dataObject.value.uuid,
      value: {
        shape: ShapeType.Rect,
        points: [
          [Math.round(xMin), Math.round(yMin)],
          [Math.round(xMin), Math.round(yMax)],
          [Math.round(xMax), Math.round(yMax)],
          [Math.round(xMax), Math.round(yMin)],
        ],
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

/**
 * Use the ClickCreateRect tool.
 * @param points The points (list of <x, y>) of (partially) created shape annotation.
 * @param categories The categories of the shape annotation.
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
  categories: Ref<MarkType[]>,
  dataObject: Ref<ImageDataObject>,
  add: (d: AnnotationCreate) => void,
  mouse: Ref<Point | null>,
  color: Ref<string | null>,
  layer: Ref<VueKonvaLayer | undefined>,
  enabled: MaybeRef<boolean> = true,
  strokeWidth: MaybeRef<number> = 5,
) => {
  useDateEffect(points, categories, dataObject, add, enabled)
  useVisualEffect(points, mouse, color, layer, enabled, strokeWidth)
}

export default useTool
