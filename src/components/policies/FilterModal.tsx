import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Slider } from '@/components/ui/slider'
import { FILTER_DEFAULTS, type ActiveFilters } from '@/hooks/useFilterParams'
import type { Region } from '@/types/policy'

const ALL_REGIONS: Region[] = ['Northeast', 'Southeast', 'Midwest', 'Southwest', 'West']

interface ModalState {
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

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentFilters: ActiveFilters
  onApply: (values: Omit<ActiveFilters, 'search'>) => void
}

export function FilterModal({ open, onOpenChange, currentFilters, onApply }: Props) {
  const [local, setLocal] = useState<ModalState>(() => toModalState(currentFilters))

  // Re-initialize from URL whenever modal opens
  useEffect(() => {
    if (open) setLocal(toModalState(currentFilters))
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  function toggleRegion(region: Region) {
    setLocal((prev) => ({
      ...prev,
      regions: prev.regions.includes(region)
        ? prev.regions.filter((r) => r !== region)
        : [...prev.regions, region],
    }))
  }

  function set<K extends keyof ModalState>(key: K, value: ModalState[K]) {
    setLocal((prev) => ({ ...prev, [key]: value }))
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Filters</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Narrow the policy list. Filters are combined with AND.
          </p>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {/* REGION */}
          <Section label="Region">
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              {ALL_REGIONS.map((r) => (
                <label key={r} className="flex items-center gap-2 cursor-pointer select-none">
                  <Checkbox
                    checked={local.regions.includes(r)}
                    onCheckedChange={() => toggleRegion(r)}
                  />
                  <span className="text-sm">{r}</span>
                </label>
              ))}
            </div>
          </Section>

          <Separator />

          {/* EFFECTIVE DATE RANGE */}
          <Section label="Effective Date Range">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">From</Label>
                <Input
                  type="date"
                  value={local.dateFrom}
                  onChange={(e) => set('dateFrom', e.target.value)}
                  className="text-sm"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">To</Label>
                <Input
                  type="date"
                  value={local.dateTo}
                  onChange={(e) => set('dateTo', e.target.value)}
                  className="text-sm"
                />
              </div>
            </div>
          </Section>

          <Separator />

          {/* PREMIUM RANGE */}
          <Section label="Premium Range ($)">
            <RangeSection
              minValue={local.premiumMin}
              maxValue={local.premiumMax}
              min={0}
              max={1_000_000}
              step={10_000}
              minLabel="$0"
              maxLabel="$1M"
              formatValue={(v) => v.toLocaleString()}
              onMinChange={(v) => set('premiumMin', v)}
              onMaxChange={(v) => set('premiumMax', v)}
              onRangeChange={([min, max]) => setLocal((p) => ({ ...p, premiumMin: min, premiumMax: max }))}
            />
          </Section>

          <Separator />

          {/* TOTAL CLAIMS RANGE */}
          <Section label="Total Claims Range ($)">
            <RangeSection
              minValue={local.claimsMin}
              maxValue={local.claimsMax}
              min={0}
              max={1_000_000}
              step={10_000}
              minLabel="$0"
              maxLabel="$1M"
              formatValue={(v) => v.toLocaleString()}
              onMinChange={(v) => set('claimsMin', v)}
              onMaxChange={(v) => set('claimsMax', v)}
              onRangeChange={([min, max]) => setLocal((p) => ({ ...p, claimsMin: min, claimsMax: max }))}
            />
          </Section>

          <Separator />

          {/* REIMBURSEMENT RISK RANGE */}
          <Section label="Reimbursement Risk Range">
            <RangeSection
              minValue={local.riskMin}
              maxValue={local.riskMax}
              min={0}
              max={1}
              step={0.01}
              minLabel="0.00"
              maxLabel="1.00"
              formatValue={(v) => v.toFixed(2)}
              onMinChange={(v) => set('riskMin', v)}
              onMaxChange={(v) => set('riskMax', v)}
              onRangeChange={([min, max]) => setLocal((p) => ({ ...p, riskMin: min, riskMax: max }))}
            />
          </Section>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <Button
            variant="ghost"
            size="sm"
            className="text-primary hover:text-primary"
            onClick={() => setLocal(DEFAULT_STATE)}
          >
            RESET ALL
          </Button>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
              CANCEL
            </Button>
            <Button size="sm" onClick={handleApply}>
              APPLY FILTERS
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
      {children}
    </div>
  )
}

interface RangeSectionProps {
  minValue: number
  maxValue: number
  min: number
  max: number
  step: number
  minLabel: string
  maxLabel: string
  formatValue: (v: number) => string
  onMinChange: (v: number) => void
  onMaxChange: (v: number) => void
  onRangeChange: (values: [number, number]) => void
}

function RangeSection({
  minValue,
  maxValue,
  min,
  max,
  step,
  minLabel,
  maxLabel,
  formatValue,
  onMinChange,
  onMaxChange,
  onRangeChange,
}: RangeSectionProps) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs text-muted-foreground mb-1 block">Min</Label>
          <Input
            type="number"
            value={minValue}
            min={min}
            max={maxValue}
            step={step}
            onChange={(e) => {
              const v = Number(e.target.value)
              if (!isNaN(v)) onMinChange(Math.min(v, maxValue))
            }}
            className="text-sm"
          />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground mb-1 block">Max</Label>
          <Input
            type="number"
            value={maxValue}
            min={minValue}
            max={max}
            step={step}
            onChange={(e) => {
              const v = Number(e.target.value)
              if (!isNaN(v)) onMaxChange(Math.max(v, minValue))
            }}
            className="text-sm"
          />
        </div>
      </div>
      <Slider
        min={min}
        max={max}
        step={step}
        value={[minValue, maxValue]}
        onValueChange={(vals) => {
          const arr = Array.isArray(vals) ? vals : [vals, vals]
          onRangeChange([arr[0], arr[1]])
        }}
        className="w-full"
      />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{minLabel}</span>
        <span>{maxLabel}</span>
      </div>
      <p className="text-xs text-muted-foreground text-center">
        {formatValue(minValue)} – {formatValue(maxValue)}
      </p>
    </div>
  )
}
