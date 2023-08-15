import { unref } from 'vue'
import type { Ref } from 'vue'
import type Konva from 'konva'
import type { MaybeRef } from '@vueuse/core'
import type { AnnotationShape } from '../../types'
import type { IEditableShape, VueKonvaLayer } from './types'
import { buildKonvaShape, findKonvaShapes } from './build-shapes'
import type { Annotation } from '~/stores/annotation'

const useKonvaShape = (
  layer: Ref<VueKonvaLayer | undefined>,
  shapes: Ref<AnnotationShape[]>,
  categoryToColor: Ref<(category: string) => string>,
  editable: Ref<boolean>,
  onEdit: MaybeRef<(d: Annotation) => void>,
  onSelect: MaybeRef<(d: Annotation) => void>,
  strokeWidth: MaybeRef<number> = 5,
) => {
  const getKonvaLayer = (): Konva.Layer | undefined => (
    layer.value?.getNode() ?? undefined
  )
  const getKonvaShapes = (): Konva.Node[] => {
    const layer = getKonvaLayer()
    if (layer === undefined) return []
    return findKonvaShapes(layer)
  }

  /** Build Konva shape objects given the shape annotations. */
  const buildKonvaShapes = () => shapes.value.map((d) => (
    buildKonvaShape(
      d,
      categoryToColor.value(d.value.category),
      unref(onEdit),
      unref(onSelect),
      editable.value,
      unref(strokeWidth),
    )
  ))

  /**
   * Set the shapes in the given uuids to be in edit state
   * and the remaining shapes to be not in edit state.
   */
  const drawEditHandle = (uuids: string[]): void => {
    getKonvaShapes().forEach((shape) => {
      const uuid = shape.getAttr('uuid') as string
      const isSelected = uuids.findIndex((d) => d === uuid) >= 0
      const editableShape = shape.getAttr('object') as IEditableShape
      if (!isSelected) {
        editableShape.endEdit()
      }
      else {
        editableShape.startEdit()
      }
    })
  }

  /** Clean the canvas and draw the shapes. */
  const redrawShapes = (): void => {
    const konvaLayer = getKonvaLayer()
    if (konvaLayer === undefined) return
    konvaLayer.destroyChildren()
    const konvaShapes = buildKonvaShapes()
    if (konvaShapes.length === 0) return
    konvaLayer.add(...konvaShapes)
  }

  /** Move the shape with the given uuid to top. */
  const moveToTop = (uuid: string): void => {
    const match = getKonvaShapes().find((d) => d.getAttr('uuid') === uuid)
    if (match === undefined) return
    match.moveToTop()
  }

  return {
    drawEditHandle,
    redrawShapes,
    moveToTop,
  }
}

export default useKonvaShape
