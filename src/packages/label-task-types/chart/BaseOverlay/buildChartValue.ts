import type { MarkType } from '../types'
import type { Point } from '~/utils/geometry'
import { getBBox } from '~/utils/geometry'
import { ShapeType } from '../../shape'
import { SchemaType } from '../types'

const buildMarks = (categories: MarkType[]) => (
  categories.map((d) => ({
    schema: SchemaType.Tabular,
    type: d,
    encode: {},
  }))
)

export const buildChartRectValue = (points: Point[], categories: MarkType[]) => {
  const { xMin, xMax, yMin, yMax } = getBBox(points)
  return {
    shape: ShapeType.Rect as const,
    points: [
      [Math.round(xMin), Math.round(yMin)],
      [Math.round(xMin), Math.round(yMax)],
      [Math.round(xMax), Math.round(yMax)],
      [Math.round(xMax), Math.round(yMin)],
    ] as [Point, Point, Point, Point],
    chart: { marks: buildMarks(categories) },
  }
}

export const buildChartPointValue = (point: Point, categories: MarkType[]) => {
  const [x, y] = point
  return {
    shape: ShapeType.Point as const,
    points: [[Math.round(x), Math.round(y)]] as [Point],
    chart: { marks: buildMarks(categories) },
  }
}

export const buildChartPolygonValue = (points: Point[], categories: MarkType[]) => ({
  shape: ShapeType.Polygon as const,
  points: points.map((d): Point => [Math.round(d[0]), Math.round(d[1])]),
  chart: { marks: buildMarks(categories) },
})
