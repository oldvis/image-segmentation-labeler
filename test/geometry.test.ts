import { describe, expect, it } from 'vitest'
import { getBBox } from '~/utils/geometry'

describe('getBBox', () => {
  it('computes axis-aligned bounds', () => {
    expect(getBBox([[2, 5], [8, 1]])).toEqual({
      xMin: 2,
      xMax: 8,
      yMin: 1,
      yMax: 5,
    })
  })

  it('handles a single point', () => {
    expect(getBBox([[3, 4]])).toEqual({
      xMin: 3,
      xMax: 3,
      yMin: 4,
      yMax: 4,
    })
  })
})
