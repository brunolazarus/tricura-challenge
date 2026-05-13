import { describe, it, expect } from 'vitest'
import { computeRisk } from './risk'

describe('computeRisk', () => {
  it('returns High at the 0.70 boundary', () => expect(computeRisk(0.70)).toBe('High'))
  it('returns High above 0.70', () => expect(computeRisk(1.0)).toBe('High'))
  it('returns Medium at the 0.40 boundary', () => expect(computeRisk(0.40)).toBe('Medium'))
  it('returns Medium just below 0.70', () => expect(computeRisk(0.69)).toBe('Medium'))
  it('returns Low just below 0.40', () => expect(computeRisk(0.39)).toBe('Low'))
  it('returns Low at 0', () => expect(computeRisk(0)).toBe('Low'))
})
