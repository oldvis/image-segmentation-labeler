import { describe, expect, it } from 'vitest'
import simplify from '~/packages/label-task-types/shape/BaseOverlay/simplify'

describe('simplify', () => {
  it('returns short polylines unchanged', () => {
    const points: [number, number][] = [[0, 0], [10, 0]]
    expect(simplify(points, 1, false)).toEqual(points)
  })

  it('removes colinear middle points with radial+DP pipeline', () => {
    // Dense samples along a straight line should collapse when tolerance is large.
    const points: [number, number][] = Array.from({ length: 21 }, (_, i) => [i, 0] as [number, number])
    const result = simplify(points, 0.5, false)
    expect(result.length).toBeLessThan(points.length)
    expect(result[0]).toEqual([0, 0])
    expect(result[result.length - 1]).toEqual([20, 0])
  })
})
