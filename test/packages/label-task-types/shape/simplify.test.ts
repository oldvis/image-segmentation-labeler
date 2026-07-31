import { describe, expect, it } from 'vitest'
import simplify from '~/packages/label-task-types/shape/BaseOverlay/simplify'

describe('simplify', () => {
  it('returns short polylines unchanged', () => {
    const pts: [number, number][] = [[0, 0], [1, 1]]
    expect(simplify(pts, 1, false)).toEqual(pts)
  })

  it('removes colinear middle points with tolerance', () => {
    const pts: [number, number][] = [
      [0, 0],
      [1, 0],
      [2, 0],
      [3, 0],
      [3, 3],
    ]
    const simplified = simplify(pts, 0.5, true)
    expect(simplified[0]).toEqual([0, 0])
    expect(simplified.at(-1)).toEqual([3, 3])
    expect(simplified.length).toBeLessThan(pts.length)
  })
})
