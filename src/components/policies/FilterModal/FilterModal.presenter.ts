import { useState } from 'react'
import { FILTER_DEFAULTS, type ActiveFilters } from '@/hooks/model/useFilterModel'
import type { Region } from '@/types/policy'

export interface ModalState {
  regions: Region[]
  dateFrom: string
  dateTo: string
  riskMin: number
  riskMax: number
  premiumMin: number
  premiumMax: number
  claimsMin: number
  claimsMax: number
}

const DEFAULT_STATE: ModalState = {
  regions: [],
  dateFrom: '',
  dateTo: '',
  riskMin: FILTER_DEFAULTS.riskMin,
  riskMax: FILTER_DEFAULTS.riskMax,
  premiumMin: FILTER_DEFAULTS.premiumMin,
  premiumMax: FILTER_DEFAULTS.premiumMax,
  claimsMin: FILTER_DEFAULTS.claimsMin,
  claimsMax: FILTER_DEFAULTS.claimsMax,
}

function toModalState(f: ActiveFilters): ModalState {
  return {
    regions: f.regions,
    dateFrom: f.dateFrom,
    dateTo: f.dateTo,
    riskMin: f.riskMin ?? FILTER_DEFAULTS.riskMin,
    riskMax: f.riskMax ?? FILTER_DEFAULTS.riskMax,
    premiumMin: f.premiumMin ?? FILTER_DEFAULTS.premiumMin,
    premiumMax: f.premiumMax ?? FILTER_DEFAULTS.premiumMax,
    claimsMin: f.claimsMin ?? FILTER_DEFAULTS.claimsMin,
    claimsMax: f.claimsMax ?? FILTER_DEFAULTS.claimsMax,
  }
}

interface Props {
  onOpenChange: (open: boolean) => void
  currentFilters: ActiveFilters
  onApply: (values: Omit<ActiveFilters, 'search'>) => void
}

export function useFilterModalPresenter({ onOpenChange, currentFilters, onApply }: Props) {
  const [local, setLocal] = useState<ModalState>(() => toModalState(currentFilters))

  function toggleRegion(region: Region) {
    setLocal((prev) => ({
      ...prev,
      regions: prev.regions.includes(region)
        ? prev.regions.filter((r) => r !== region)
        : [...prev.regions, region],
    }))
  }

  function setField<K extends keyof ModalState>(key: K, value: ModalState[K]) {
    setLocal((prev) => ({ ...prev, [key]: value }))
  }

  function setPair(
    minKey: keyof ModalState,
    maxKey: keyof ModalState,
    values: [number, number],
  ) {
    setLocal((prev) => ({ ...prev, [minKey]: values[0], [maxKey]: values[1] }))
  }

  function handleApply() {
    onApply({
      regions: local.regions,
      dateFrom: local.dateFrom,
      dateTo: local.dateTo,
      riskMin: local.riskMin !== FILTER_DEFAULTS.riskMin ? local.riskMin : null,
      riskMax: local.riskMax !== FILTER_DEFAULTS.riskMax ? local.riskMax : null,
      premiumMin: local.premiumMin !== FILTER_DEFAULTS.premiumMin ? local.premiumMin : null,
      premiumMax: local.premiumMax !== FILTER_DEFAULTS.premiumMax ? local.premiumMax : null,
      claimsMin: local.claimsMin !== FILTER_DEFAULTS.claimsMin ? local.claimsMin : null,
      claimsMax: local.claimsMax !== FILTER_DEFAULTS.claimsMax ? local.claimsMax : null,
    })
    onOpenChange(false)
  }

  function handleReset() {
    setLocal(DEFAULT_STATE)
  }

  function handleCancel() {
    onOpenChange(false)
  }

  return { local, toggleRegion, setField, setPair, handleApply, handleReset, handleCancel }
}
