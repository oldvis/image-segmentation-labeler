import type Konva from 'konva'
import type { Component, MaybeRef, Ref } from 'vue'
import type { MarkType } from '../types'
import type { AnnotationCreate, ImageDataObject } from '~/stores/annotation'
import type { Point } from '~/utils/geometry'
import { onKeyStroke } from '@vueuse/core'
import { unref } from 'vue'
import { AnnotationType } from '~/stores/annotation'
import { useVisualEffect } from '../../shape/BaseOverlay/useToolClickCreatePolygon'
import { buildChartPolygonValue } from './buildChartValue'

type VueKonvaLayer = Component & { getNode: () => Konva.Layer }

/**
 * Use the ClickCreatePolygon tool's effect on the data store.
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
  // Finish polygon creation when key press enter.
  onKeyStroke('Enter', () => {
    if (!unref(enabled)) return
    if (categories.value.length === 0 || points.value.length <= 2) return
    add({
      type: AnnotationType.Chart,
      subject: dataObject.value.uuid,
      value: buildChartPolygonValue(points.value, categories.value),
    })
    points.value = []
  })
}

/**
 * Use the ClickCreatePolygon tool.
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
