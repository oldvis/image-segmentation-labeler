export type Point = [number, number]

export interface BBox {
  xMin: number
  xMax: number
  yMin: number
  yMax: number
}

export function getBBox(points: Point[]): BBox {
  const xMin = Math.min(...points.map((d) => d[0]))
  const xMax = Math.max(...points.map((d) => d[0]))
  const yMin = Math.min(...points.map((d) => d[1]))
  const yMax = Math.max(...points.map((d) => d[1]))
  return { xMin, xMax, yMin, yMax }
}
