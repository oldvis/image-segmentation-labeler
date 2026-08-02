import type { MaybeRef, Ref } from 'vue'
import type { MarkType } from '../types'
import type { AnnotationCreate, ImageDataObject } from '~/stores/annotation'
import type { Point } from '~/utils/geometry'
import { unref, watch } from 'vue'
import { AnnotationType } from '~/stores/annotation'
import { buildChartPointValue } from './buildChartValue'

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
  categories: Ref<MarkType[]>,
  dataObject: Ref<ImageDataObject>,
  add: (d: AnnotationCreate) => void,
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
      value: buildChartPointValue(points.value[0], categories.value),
    })
    points.value = []
  })
}

export default useTool
