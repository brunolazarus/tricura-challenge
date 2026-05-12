import { useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { Region, PolicyListParams } from '@/types/policy'

const ALL_REGIONS: Region[] = ['Northeast', 'Southeast', 'Midwest', 'Southwest', 'West']

export interface ActiveFilters {
  search: string
  regions: Region[]
  dateFrom: string
  dateTo: string
  riskMin: number | null
  riskMax: number | null
  premiumMin: number | null
  premiumMax: number | null
  claimsMin: number | null
  claimsMax: number | null
}

export const FILTER_DEFAULTS = {
  riskMin: 0,
  riskMax: 1,
  premiumMin: 0,
  premiumMax: 1_000_000,
  claimsMin: 0,
  claimsMax: 1_000_000,
}

function parseRegions(raw: string | null): Region[] {
  if (!raw) return []
  return raw.split(',').filter((r): r is Region => ALL_REGIONS.includes(r as Region))
}

function parseNum(raw: string | null): number | null {
  if (raw === null || raw === '') return null
  const n = Number(raw)
  return isNaN(n) ? null : n
}

function setNumParam(
  params: URLSearchParams,
  key: string,
  value: number | null,
  defaultValue: number,
) {
  if (value !== null && value !== defaultValue) {
    params.set(key, String(value))
  } else {
    params.delete(key)
  }
}

export function useFilterModel() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [searchDraft, setSearchDraft] = useState(searchParams.get('search') ?? '')
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const filters: ActiveFilters = {
    search: searchParams.get('search') ?? '',
    regions: parseRegions(searchParams.get('regions')),
    dateFrom: searchParams.get('dateFrom') ?? '',
    dateTo: searchParams.get('dateTo') ?? '',
    riskMin: parseNum(searchParams.get('riskMin')),
    riskMax: parseNum(searchParams.get('riskMax')),
    premiumMin: parseNum(searchParams.get('premiumMin')),
    premiumMax: parseNum(searchParams.get('premiumMax')),
    claimsMin: parseNum(searchParams.get('claimsMin')),
    claimsMax: parseNum(searchParams.get('claimsMax')),
  }

  const page = Math.max(1, Number(searchParams.get('page') ?? '1'))
  const limit = Number(searchParams.get('limit') ?? '20')

  // API only supports a single region param — omit when >1 selected.
  function toPolicyListParams(): PolicyListParams {
    return {
      page,
      limit,
      search: filters.search || undefined,
      region: filters.regions.length === 1 ? filters.regions[0] : undefined,
      effectiveDateFrom: filters.dateFrom || undefined,
      effectiveDateTo: filters.dateTo || undefined,
      reimbursementRiskMin: filters.riskMin ?? undefined,
      reimbursementRiskMax: filters.riskMax ?? undefined,
      premiumMin: filters.premiumMin ?? undefined,
      premiumMax: filters.premiumMax ?? undefined,
      claimsTotalMin: filters.claimsMin ?? undefined,
      claimsTotalMax: filters.claimsMax ?? undefined,
    }
  }

  function setSearch(value: string) {
    setSearchDraft(value)
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current)
    searchTimerRef.current = setTimeout(() => {
      const next = new URLSearchParams(searchParams)
      if (value) next.set('search', value)
      else next.delete('search')
      next.set('page', '1')
      setSearchParams(next, { replace: true })
    }, 300)
  }

  function applyFilters(values: Omit<ActiveFilters, 'search'>) {
    const next = new URLSearchParams(searchParams)
    next.set('page', '1')

    values.regions.length > 0
      ? next.set('regions', values.regions.join(','))
      : next.delete('regions')

    values.dateFrom ? next.set('dateFrom', values.dateFrom) : next.delete('dateFrom')
    values.dateTo ? next.set('dateTo', values.dateTo) : next.delete('dateTo')

    setNumParam(next, 'riskMin', values.riskMin, FILTER_DEFAULTS.riskMin)
    setNumParam(next, 'riskMax', values.riskMax, FILTER_DEFAULTS.riskMax)
    setNumParam(next, 'premiumMin', values.premiumMin, FILTER_DEFAULTS.premiumMin)
    setNumParam(next, 'premiumMax', values.premiumMax, FILTER_DEFAULTS.premiumMax)
    setNumParam(next, 'claimsMin', values.claimsMin, FILTER_DEFAULTS.claimsMin)
    setNumParam(next, 'claimsMax', values.claimsMax, FILTER_DEFAULTS.claimsMax)

    setSearchParams(next, { replace: true })
  }

  function dismissFilter(key: 'regions' | 'dates' | 'risk' | 'premium' | 'claims') {
    const next = new URLSearchParams(searchParams)
    next.set('page', '1')
    const removes: Record<typeof key, string[]> = {
      regions: ['regions'],
      dates: ['dateFrom', 'dateTo'],
      risk: ['riskMin', 'riskMax'],
      premium: ['premiumMin', 'premiumMax'],
      claims: ['claimsMin', 'claimsMax'],
    }
    removes[key].forEach((k) => next.delete(k))
    setSearchParams(next, { replace: true })
  }

  function clearAll() {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current)
    setSearchDraft('')
    const next = new URLSearchParams()
    const l = searchParams.get('limit')
    if (l) next.set('limit', l)
    setSearchParams(next, { replace: true })
  }

  const activeFilterCount = [
    filters.regions.length > 0,
    !!(filters.dateFrom || filters.dateTo),
    filters.riskMin !== null || filters.riskMax !== null,
    filters.premiumMin !== null || filters.premiumMax !== null,
    filters.claimsMin !== null || filters.claimsMax !== null,
  ].filter(Boolean).length

  const hasAnyFilter = activeFilterCount > 0 || !!filters.search

  return {
    filters,
    searchDraft,
    page,
    limit,
    activeFilterCount,
    hasAnyFilter,
    toPolicyListParams,
    setSearch,
    applyFilters,
    dismissFilter,
    clearAll,
  }
}
