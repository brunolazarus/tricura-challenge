import { useState } from 'react'
import { useFilterModel, FILTER_DEFAULTS, type ActiveFilters } from '@/hooks/model/useFilterModel'
import { formatMoney, formatDate } from '@/lib/format'
import type { Region } from '@/types/policy'

export interface FilterChip {
  key: 'regions' | 'dates' | 'risk' | 'premium' | 'claims'
  label: string
}

export function useFilterPresenter() {
  const model = useFilterModel()
  const [modalOpen, setModalOpen] = useState(false)
  const [modalSession, setModalSession] = useState(0)

  function openModal() {
    setModalSession((s) => s + 1)
    setModalOpen(true)
  }

  return {
    searchValue: model.searchDraft,
    onSearchChange: model.setSearch,
    chips: buildChips(model.filters),
    onDismissChip: model.dismissFilter,
    onClearAll: model.clearAll,
    activeCount: model.activeFilterCount,
    hasAnyFilter: model.hasAnyFilter,
    modalOpen,
    modalSession,
    openModal,
    onModalOpenChange: setModalOpen,
    currentFilters: model.filters,
    onApply: model.applyFilters,
  }
}

export function buildChips(f: ActiveFilters): FilterChip[] {
  const chips: FilterChip[] = []

  if (f.regions.length > 0) {
    chips.push({ key: 'regions', label: `Region: ${f.regions.join(', ')}` })
  }
  if (f.dateFrom || f.dateTo) {
    const parts: string[] = []
    if (f.dateFrom) parts.push(formatDate(f.dateFrom, 'MMM yyyy'))
    if (f.dateTo) parts.push(formatDate(f.dateTo, 'MMM yyyy'))
    chips.push({ key: 'dates', label: `Effective: ${parts.join(' – ')}` })
  }
  if (f.riskMin !== null || f.riskMax !== null) {
    chips.push({
      key: 'risk',
      label: `Risk: ${numRange(f.riskMin, f.riskMax, FILTER_DEFAULTS.riskMin, FILTER_DEFAULTS.riskMax, (v) => v.toFixed(2))}`,
    })
  }
  if (f.premiumMin !== null || f.premiumMax !== null) {
    chips.push({
      key: 'premium',
      label: `Premium: ${numRange(f.premiumMin, f.premiumMax, FILTER_DEFAULTS.premiumMin, FILTER_DEFAULTS.premiumMax, formatMoney)}`,
    })
  }
  if (f.claimsMin !== null || f.claimsMax !== null) {
    chips.push({
      key: 'claims',
      label: `Claims: ${numRange(f.claimsMin, f.claimsMax, FILTER_DEFAULTS.claimsMin, FILTER_DEFAULTS.claimsMax, formatMoney)}`,
    })
  }

  return chips
}

function numRange(
  min: number | null,
  max: number | null,
  defaultMin: number,
  defaultMax: number,
  fmt: (v: number) => string,
): string {
  return `${fmt(min ?? defaultMin)} – ${fmt(max ?? defaultMax)}`
}

// Re-export for FilterModal prop typing
export type { ActiveFilters, Region }
