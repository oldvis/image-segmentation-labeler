import { unref, watch } from 'vue'
import type { Component, Ref } from 'vue'
import type Konva from 'konva'
import type { MaybeRef } from '@vueuse/core'
import { useVisualEffect } from '../../shape/BaseOverlay/useToolClickCreateRect'
import { ShapeType } from '../../shape'
import { SchemaType } from '../types'
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
 * @param categories The categories of the shape annotation.
 * @param dataObject The data object to which the shape annotation is attached.
 * @param add The function to add annotation to the annotation store.
 * @param enabled Whether the tool is enabled.
 */
const useDateEffect = (
  points: Ref<Point[]>,
  categories: Ref<string[]>,
  dataObject: Ref<DataObject>,
  add: (d: Omit<Annotation, 'uuid' | 'user' | 'time'>) => void,
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
        points: [[xMin, yMin], [xMin, yMax], [xMax, yMax], [xMax, yMin]]
          .map((d) => [Math.round(d[0]), Math.round(d[1])]),
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
  categories: Ref<string[]>,
  dataObject: Ref<DataObject>,
  add: (d: Omit<Annotation, 'uuid' | 'user' | 'time'>) => void,
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
