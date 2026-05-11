import { useEffect, useRef, useState } from 'react'
import { SlidersHorizontal, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FilterModal } from './FilterModal'
import { useFilterParams, type ActiveFilters } from '@/hooks/useFilterParams'
import { formatMoney, formatDate } from '@/lib/format'
import type { Region } from '@/types/policy'

export function FilterBar() {
  const { filters, activeFilterCount, hasAnyFilter, applySearch, applyFilters, dismissFilter, clearAllFilters } =
    useFilterParams()

  const [modalOpen, setModalOpen] = useState(false)
  const [inputValue, setInputValue] = useState(filters.search)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Sync input when URL search changes externally (e.g., clear all)
  useEffect(() => {
    setInputValue(filters.search)
  }, [filters.search])

  function handleSearchChange(value: string) {
    setInputValue(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => applySearch(value), 300)
  }

  const chips = buildChips(filters)

  return (
    <>
      <div className="flex items-center gap-2 px-4 py-2 border-b border-border bg-white min-h-[44px]">
        {/* Search */}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Search accounts by name…"
          className="flex-none w-56 text-sm bg-transparent outline-none placeholder:text-muted-foreground text-foreground"
        />

        {/* Filter trigger */}
        <Button
          variant="outline"
          size="sm"
          className="shrink-0 gap-1.5 text-xs font-semibold tracking-wide h-7 px-2.5"
          onClick={() => setModalOpen(true)}
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          FILTERS
          {activeFilterCount > 0 && (
            <span className="text-primary font-bold">· {activeFilterCount}</span>
          )}
        </Button>

        {/* Active filter chips */}
        <div className="flex items-center gap-1.5 flex-1 flex-wrap">
          {chips.map((chip) => (
            <FilterChip
              key={chip.key}
              label={chip.label}
              onDismiss={() => dismissFilter(chip.key)}
            />
          ))}
        </div>

        {/* Clear all */}
        {hasAnyFilter && (
          <Button
            variant="ghost"
            size="sm"
            className="shrink-0 text-xs font-semibold tracking-wide text-muted-foreground hover:text-foreground h-7 px-2"
            onClick={clearAllFilters}
          >
            CLEAR ALL
          </Button>
        )}
      </div>

      <FilterModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        currentFilters={filters}
        onApply={applyFilters}
      />
    </>
  )
}

function FilterChip({
  label,
  onDismiss,
}: {
  label: string
  onDismiss: () => void
}) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary text-xs font-medium px-2.5 py-0.5">
      {label}
      <button
        onClick={onDismiss}
        className="ml-0.5 rounded-full hover:bg-primary/20 p-0.5 transition-colors"
        aria-label={`Remove filter: ${label}`}
      >
        <X className="h-3 w-3" />
      </button>
    </span>
  )
}

interface Chip {
  key: Parameters<ReturnType<typeof useFilterParams>['dismissFilter']>[0]
  label: string
}

function buildChips(f: ActiveFilters): Chip[] {
  const chips: Chip[] = []

  if (f.regions.length > 0) {
    chips.push({ key: 'regions', label: `Region: ${formatRegions(f.regions)}` })
  }

  if (f.dateFrom || f.dateTo) {
    chips.push({ key: 'dates', label: `Effective: ${formatDateRange(f.dateFrom, f.dateTo)}` })
  }

  if (f.riskMin !== null || f.riskMax !== null) {
    chips.push({ key: 'risk', label: `Risk: ${formatNumRange(f.riskMin, f.riskMax, 0, 1, (v) => v.toFixed(2))}` })
  }

  if (f.premiumMin !== null || f.premiumMax !== null) {
    chips.push({ key: 'premium', label: `Premium: ${formatNumRange(f.premiumMin, f.premiumMax, 0, 1_000_000, formatMoney)}` })
  }

  if (f.claimsMin !== null || f.claimsMax !== null) {
    chips.push({ key: 'claims', label: `Claims: ${formatNumRange(f.claimsMin, f.claimsMax, 0, 1_000_000, formatMoney)}` })
  }

  return chips
}

function formatRegions(regions: Region[]): string {
  return regions.join(', ')
}

function formatDateRange(from: string, to: string): string {
  const parts: string[] = []
  if (from) parts.push(formatDate(from, 'MMM yyyy'))
  if (to) parts.push(formatDate(to, 'MMM yyyy'))
  return parts.join(' – ')
}

function formatNumRange(
  min: number | null,
  max: number | null,
  defaultMin: number,
  defaultMax: number,
  fmt: (v: number) => string,
): string {
  const lo = fmt(min ?? defaultMin)
  const hi = fmt(max ?? defaultMax)
  return `${lo} – ${hi}`
}
