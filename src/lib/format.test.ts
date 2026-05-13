import { describe, it, expect } from 'vitest'
import { formatMoney, formatDate } from './format'

describe('formatMoney', () => {
  it('abbreviates whole millions', () => expect(formatMoney(2_000_000)).toBe('$2M'))
  it('abbreviates fractional millions', () => expect(formatMoney(1_500_000)).toBe('$1.5M'))
  it('abbreviates thousands', () => expect(formatMoney(300_000)).toBe('$300k'))
  it('rounds to nearest thousand', () => expect(formatMoney(299_500)).toBe('$300k'))
  it('formats small values without abbreviation', () => expect(formatMoney(500)).toBe('$500'))
  it('formats zero', () => expect(formatMoney(0)).toBe('$0'))
})

describe('formatDate', () => {
  it('formats an ISO date string with the default pattern', () => {
    expect(formatDate('2026-07-01')).toBe('Jul 1, 2026')
  })
  it('supports a custom pattern', () => {
    expect(formatDate('2026-07-01', 'MMM yyyy')).toBe('Jul 2026')
  })
  it('returns the raw string on invalid input', () => {
    expect(formatDate('not-a-date')).toBe('not-a-date')
  })
})
