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
})
