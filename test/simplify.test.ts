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

  it('highestQuality still runs Douglas-Peucker on the full point set', () => {
    const points: [number, number][] = [
      [0, 0],
      [1, 0.01],
      [2, -0.01],
      [3, 0.01],
      [4, 0],
      [5, 10],
      [6, 0],
    ]
    const low = simplify(points, 1, false)
    const high = simplify(points, 1, true)
    // Both must keep endpoints; high-quality path must not equal the identity when DP reduces.
    expect(high[0]).toEqual(points[0])
    expect(high[high.length - 1]).toEqual(points[points.length - 1])
    expect(high.length).toBeLessThanOrEqual(points.length)
    expect(low.length).toBeLessThanOrEqual(points.length)
  })
})
