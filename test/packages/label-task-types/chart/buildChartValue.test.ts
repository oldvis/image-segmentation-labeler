import { describe, expect, it } from 'vitest'
import {
  buildChartPointValue,
  buildChartPolygonValue,
  buildChartRectValue,
} from '~/packages/label-task-types/chart/BaseOverlay/buildChartValue'
import { SchemaType } from '~/packages/label-task-types/chart/types'
import { ShapeType } from '~/packages/label-task-types/shape'

describe('buildChartValue', () => {
  it('builds axis-aligned rect points and marks from categories', () => {
    expect(buildChartRectValue([[10, 20], [40, 60]], ['Rect', 'Text'])).toEqual({
      shape: ShapeType.Rect,
      points: [[10, 20], [10, 60], [40, 60], [40, 20]],
      chart: {
        marks: [
          { schema: SchemaType.Tabular, type: 'Rect', encode: {} },
          { schema: SchemaType.Tabular, type: 'Text', encode: {} },
        ],
      },
    })
  })

  it('builds a rounded point and marks from categories', () => {
    expect(buildChartPointValue([10.4, 20.6], ['Point'])).toEqual({
      shape: ShapeType.Point,
      points: [[10, 21]],
      chart: {
        marks: [
          { schema: SchemaType.Tabular, type: 'Point', encode: {} },
        ],
      },
    })
  })

  it('rounds polygon vertices and builds marks from categories', () => {
    expect(buildChartPolygonValue([[1.2, 3.7], [4, 5], [6, 8]], ['Area'])).toEqual({
      shape: ShapeType.Polygon,
      points: [[1, 4], [4, 5], [6, 8]],
      chart: {
        marks: [
          { schema: SchemaType.Tabular, type: 'Area', encode: {} },
        ],
      },
    })
  })
})
