import { describe, expect, it, vi } from 'vitest'
import { buildKonvaShape, findKonvaShapes } from '~/packages/label-task-types/shape/BaseOverlay/TheLayerShapes/build-shapes'
import { ShapeType } from '~/packages/label-task-types/shape/types'
import { AnnotationType } from '~/stores/annotation'

const makeShape = (shape: ShapeType, points: number[][]) => ({
  type: AnnotationType.Shape,
  uuid: 'shape-1',
  subject: 'img-1',
  user: null,
  time: null,
  value: { shape, points, category: 'Rect' },
}) as never

describe('buildKonvaShape', () => {
  it('tags point/rect/polygon nodes with shape metadata', () => {
    const onEdit = vi.fn()
    const onSelect = vi.fn()

    const point = buildKonvaShape(makeShape(ShapeType.Point, [[5, 6]]), 'red', onEdit, onSelect, false, 2)
    const rect = buildKonvaShape(
      makeShape(ShapeType.Rect, [[0, 0], [0, 10], [10, 10], [10, 0]]),
      'blue',
      onEdit,
      onSelect,
      false,
      2,
    )
    const polygon = buildKonvaShape(
      makeShape(ShapeType.Polygon, [[0, 0], [0, 10], [10, 10], [10, 0]]),
      'green',
      onEdit,
      onSelect,
      false,
      2,
    )

    for (const node of [point, rect, polygon]) {
      expect(node.name()).toBe('editable-shape')
      expect(node.getAttr('uuid')).toBe('shape-1')
      expect(node.getAttr('object')).toBeTruthy()
    }
  })
})

describe('findKonvaShapes', () => {
  it('queries the editable-shape name selector on the layer', () => {
    const found = [{ name: () => 'editable-shape' }]
    const layer = {
      find: vi.fn((selector: string) => (selector === '.editable-shape' ? found : [])),
    }
    expect(findKonvaShapes(layer as never)).toEqual(found)
    expect(layer.find).toHaveBeenCalledWith('.editable-shape')
  })
})
