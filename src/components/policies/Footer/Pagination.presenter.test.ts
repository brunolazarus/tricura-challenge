import { describe, it, expect } from 'vitest'
import { buildPageNumbers } from './Pagination.presenter'

describe('buildPageNumbers', () => {
  it('returns all pages when total is 7 or fewer', () => {
    expect(buildPageNumbers(1, 5)).toEqual([1, 2, 3, 4, 5])
    expect(buildPageNumbers(4, 7)).toEqual([1, 2, 3, 4, 5, 6, 7])
  })

  it('shows a trailing ellipsis when near the start', () => {
    expect(buildPageNumbers(1, 10)).toEqual([1, 2, '...', 10])
    expect(buildPageNumbers(2, 10)).toEqual([1, 2, 3, '...', 10])
  })

  it('shows a leading ellipsis when near the end', () => {
    expect(buildPageNumbers(10, 10)).toEqual([1, '...', 9, 10])
    expect(buildPageNumbers(9, 10)).toEqual([1, '...', 8, 9, 10])
  })

  it('shows both ellipses when in the middle', () => {
    expect(buildPageNumbers(5, 10)).toEqual([1, '...', 4, 5, 6, '...', 10])
  })
})
