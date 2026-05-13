import { describe, it, expect } from 'vitest'
import { buildChips } from './FilterBar.presenter'
import type { ActiveFilters } from '@/hooks/model/useFilterModel'

const empty: ActiveFilters = {
  search: '',
  regions: [],
  dateFrom: '',
  dateTo: '',
  riskMin: null,
  riskMax: null,
  premiumMin: null,
  premiumMax: null,
  claimsMin: null,
  claimsMax: null,
}

describe('buildChips', () => {
  it('returns no chips for empty filters', () => {
    expect(buildChips(empty)).toEqual([])
  })

  it('shows a region chip for a single region', () => {
    const chips = buildChips({ ...empty, regions: ['Northeast'] })
    expect(chips).toHaveLength(1)
    expect(chips[0]).toEqual({ key: 'regions', label: 'Region: Northeast' })
  })

  it('joins multiple regions with a comma', () => {
    const chips = buildChips({ ...empty, regions: ['Northeast', 'Midwest'] })
    expect(chips[0].label).toBe('Region: Northeast, Midwest')
  })

  it('shows a date chip for a full date range', () => {
    const chips = buildChips({ ...empty, dateFrom: '2026-01-01', dateTo: '2026-12-01' })
    expect(chips[0]).toEqual({ key: 'dates', label: 'Effective: Jan 2026 – Dec 2026' })
  })

  it('shows a date chip for only a start date', () => {
    const chips = buildChips({ ...empty, dateFrom: '2026-05-01' })
    expect(chips[0].label).toBe('Effective: May 2026')
  })

  it('shows a date chip for only an end date', () => {
    const chips = buildChips({ ...empty, dateTo: '2026-12-01' })
    expect(chips[0].label).toBe('Effective: Dec 2026')
  })

  it('shows a risk chip with explicit bounds', () => {
    const chips = buildChips({ ...empty, riskMin: 0.20, riskMax: 0.85 })
    expect(chips[0]).toEqual({ key: 'risk', label: 'Risk: 0.20 – 0.85' })
  })

  it('falls back to defaults for null risk bounds', () => {
    const chips = buildChips({ ...empty, riskMin: 0.20, riskMax: null })
    expect(chips[0].label).toBe('Risk: 0.20 – 1.00')
  })

  it('shows a premium chip', () => {
    const chips = buildChips({ ...empty, premiumMin: 200_000, premiumMax: 500_000 })
    expect(chips[0]).toEqual({ key: 'premium', label: 'Premium: $200k – $500k' })
  })

  it('shows a claims chip', () => {
    const chips = buildChips({ ...empty, claimsMin: 0, claimsMax: 400_000 })
    expect(chips[0]).toEqual({ key: 'claims', label: 'Claims: $0 – $400k' })
  })

  it('emits one chip per active filter group', () => {
    const chips = buildChips({
      ...empty,
      regions: ['West'],
      riskMin: 0.5,
      premiumMax: 300_000,
    })
    expect(chips.map((c) => c.key)).toEqual(['regions', 'risk', 'premium'])
  })
})
