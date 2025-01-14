import type Konva from 'konva'
import type { AnnotationShapeLike } from '../../types'
import type { Annotation } from '~/stores/annotation'
import { unref } from 'vue'
import { ShapeType } from '../../types'
import EditableCircle from './editable-circle'
import EditablePolygon from './editable-polygon'
import EditableRect from './editable-rect'

const SHAPE_NAME = 'editable-shape'

const buildKonvaCircle = (
  annotationCircle: AnnotationShapeLike,
  color: string,
  onEdit: (d: Annotation) => void,
  onSelect: (d: Annotation) => void,
  editable = true,
  strokeWidth = 1,
): Konva.Circle => {
  const [[x, y]] = annotationCircle.value.points as [[number, number]]
  const { uuid } = annotationCircle

  const editableCircle = new EditableCircle({ x, y }, editable, strokeWidth)
  const konvaCircle = editableCircle.getNode()
    .stroke(color)
    .name(SHAPE_NAME)
    .setAttr('object', editableCircle)
    .setAttr('uuid', uuid)
  editableCircle.setOnUpdatePosition((d: EditableCircle) => {
    const point = d.point()
    onEdit({
      ...annotationCircle,
      value: {
        ...annotationCircle.value,
        points: [[point.x, point.y]],
      },
    })
  })
  editableCircle.setOnClick(() => onSelect(annotationCircle))
  return konvaCircle
}

const buildKonvaRect = (
  annotationRect: AnnotationShapeLike,
  color: string,
  onEdit: (d: Annotation) => void,
  onSelect: (d: Annotation) => void,
  editable = true,
  strokeWidth = 1,
): Konva.Group => {
  const { points } = annotationRect.value
  const { uuid } = annotationRect

  const editableRect = new EditableRect(points, editable, strokeWidth)
  const konvaGroup = editableRect.getNode()
    .name(SHAPE_NAME)
    .setAttr('object', editableRect)
    .setAttr('uuid', uuid)
  editableRect.getRect().stroke(color)
  editableRect.setOnUpdatePosition((d: EditableRect) => {
    const [[xMin, yMin], [xMax, yMax]] = d.points()
    onEdit({
      ...annotationRect,
      value: {
        ...annotationRect.value,
        points: [
          [xMin, yMin],
          [xMin, yMax],
          [xMax, yMax],
          [xMax, yMin],
        ],
      },
    })
  })
  editableRect.setOnClick(() => onSelect(annotationRect))
  return konvaGroup
}

const buildKonvaPolygon = (
  annotationPolygon: AnnotationShapeLike,
  color: string,
  onEdit: (d: Annotation) => void,
  onSelect: (d: Annotation) => void,
  editable = true,
  strokeWidth = 1,
): Konva.Group => {
  const { points } = annotationPolygon.value
  const { uuid } = annotationPolygon

  const editablePolygon = new EditablePolygon(points, editable, strokeWidth)
  const konvaGroup = editablePolygon.getNode()
    .name(SHAPE_NAME)
    .setAttr('object', editablePolygon)
    .setAttr('uuid', uuid)
  editablePolygon.getPolygon().stroke(color)
  editablePolygon.setOnUpdatePosition((d: EditablePolygon) => {
    const points = d.points()
    onEdit({
      ...annotationPolygon,
      value: {
        ...annotationPolygon.value,
        points,
      },
    })
  })
  editablePolygon.setOnClick(() => onSelect(annotationPolygon))
  return konvaGroup
}

export const buildKonvaShape = (
  annotation: AnnotationShapeLike,
  color: string,
  onEdit: (d: Annotation) => void,
  onSelect: (d: Annotation) => void,
  editable = true,
  strokeWidth = 1,
) => {
  const builder = {
    [ShapeType.Point]: buildKonvaCircle,
    [ShapeType.Rect]: buildKonvaRect,
    [ShapeType.Polygon]: buildKonvaPolygon,
  }[annotation.value.shape]
  return builder(
    annotation,
    color,
    unref(onEdit),
    unref(onSelect),
    editable,
    strokeWidth,
  )
}

export const findKonvaShapes = (layer: Konva.Layer): Konva.Node[] => {
  return layer.find(`.${SHAPE_NAME}`)
}
