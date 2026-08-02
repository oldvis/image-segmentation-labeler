/**
 * Intentional thin chart router: same tool matrix as shape `useTools`, but
 * wires chart create hooks (MarkType[] categories + Chart payloads). Not
 * merged with shape — category arity and tool modules differ.
 */
import type Konva from 'konva'
import type { Component, MaybeRef, Ref } from 'vue'
import type { MarkType } from '../types'
import type { AnnotationCreate, ImageDataObject } from '~/stores/annotation'
import { computed } from 'vue'
import { ToolType } from '../stores/toolbar'
import useToolClickCreatePoint from './useToolClickCreatePoint'
import useToolClickCreatePolygon from './useToolClickCreatePolygon'
import useToolClickCreateRect from './useToolClickCreateRect'
import useToolDragCreatePolygon from './useToolDragCreatePolygon'

type Point = [number, number]
type VueKonvaLayer = Component & { getNode: () => Konva.Layer }

/**
 * Use the create shape tools.
 * @param points The points (list of <x, y>) of (partially) created shape annotation.
 * @param categories The categories of the shape annotation.
 * @param dataObject The data object to which the shape annotation is attached.
 * @param add The function to add annotation to the annotation store.
 * @param mouse The current mouse position <x, y>.
 * @param color The color of the shape to be created
 * @param layer The Konva layer to show the effect.
 * @param tool The tool that is enabled.
 * @param strokeWidth The stroke width of the shape shown in the interface.
 */
const useTools = (
  points: Ref<Point[]>,
  categories: Ref<MarkType[]>,
  dataObject: Ref<ImageDataObject>,
  add: (d: AnnotationCreate) => void,
  mouse: Ref<Point | null>,
  color: Ref<string | null>,
  layer: Ref<VueKonvaLayer | undefined>,
  tool: Ref<ToolType>,
  strokeWidth: MaybeRef<number> = 5,
) => {
  useToolClickCreatePoint(
    points,
    categories,
    dataObject,
    add,
    computed(() => tool.value === ToolType.ClickCreatePoint),
  )
  useToolClickCreateRect(
    points,
    categories,
    dataObject,
    add,
    mouse,
    color,
    layer,
    computed(() => tool.value === ToolType.ClickCreateRect),
    strokeWidth,
  )
  useToolClickCreatePolygon(
    points,
    categories,
    dataObject,
    add,
    mouse,
    color,
    layer,
    computed(() => tool.value === ToolType.ClickCreatePolygon),
    strokeWidth,
  )
  useToolDragCreatePolygon(
    points,
    categories,
    dataObject,
    add,
    mouse,
    color,
    layer,
    computed(() => tool.value === ToolType.DragCreatePolygon),
    strokeWidth,
  )
}

export default useTools
