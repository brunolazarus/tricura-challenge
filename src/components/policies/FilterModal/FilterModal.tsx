import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { Slider } from '@/components/ui/slider'
import { FieldBox, fieldBoxInputCls } from '@/components/ui/field-box'
import { useFilterModalPresenter } from './FilterModal.presenter'
import type { ActiveFilters } from '@/hooks/model/useFilterModel'
import type { Region } from '@/types/policy'

const ALL_REGIONS: Region[] = ['Northeast', 'Southeast', 'Midwest', 'Southwest', 'West']

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  sessionKey: number
  currentFilters: ActiveFilters
  onApply: (values: Omit<ActiveFilters, 'search'>) => void
}

export function FilterModal({ open, onOpenChange, sessionKey, currentFilters, onApply }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-216 max-h-[90vh] overflow-y-auto">
        <FilterModalContent
          key={sessionKey}
          currentFilters={currentFilters}
          onApply={onApply}
          onOpenChange={onOpenChange}
        />
      </DialogContent>
    </Dialog>
  )
}

interface ContentProps {
  currentFilters: ActiveFilters
  onApply: (values: Omit<ActiveFilters, 'search'>) => void
  onOpenChange: (open: boolean) => void
}

function FilterModalContent({ currentFilters, onApply, onOpenChange }: ContentProps) {
  const { local, toggleRegion, setField, setPair, handleApply, handleReset, handleCancel } =
    useFilterModalPresenter({ currentFilters, onApply, onOpenChange })

  return (
    <>
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
            <FieldBox label="From">
              <input
                type="date"
                value={local.dateFrom}
                onChange={(e) => setField('dateFrom', e.target.value)}
                className={fieldBoxInputCls}
              />
            </FieldBox>
            <FieldBox label="To">
              <input
                type="date"
                value={local.dateTo}
                onChange={(e) => setField('dateTo', e.target.value)}
                className={fieldBoxInputCls}
              />
            </FieldBox>
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
            onMinChange={(v) => setField('premiumMin', v)}
            onMaxChange={(v) => setField('premiumMax', v)}
            onRangeChange={(values) => setPair('premiumMin', 'premiumMax', values)}
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
            onMinChange={(v) => setField('claimsMin', v)}
            onMaxChange={(v) => setField('claimsMax', v)}
            onRangeChange={(values) => setPair('claimsMin', 'claimsMax', values)}
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
            onMinChange={(v) => setField('riskMin', v)}
            onMaxChange={(v) => setField('riskMax', v)}
            onRangeChange={(values) => setPair('riskMin', 'riskMax', values)}
          />
        </Section>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <Button
          variant="ghost"
          size="sm"
          className="text-primary hover:text-primary"
          onClick={handleReset}
        >
          RESET ALL
        </Button>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={handleCancel}>
            CANCEL
          </Button>
          <Button size="sm" onClick={handleApply}>
            APPLY FILTERS
          </Button>
        </div>
      </div>
    </>
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
        <FieldBox label="Min">
          <input
            type="number"
            value={minValue}
            min={min}
            max={maxValue}
            step={step}
            onChange={(e) => {
              const v = Number(e.target.value)
              if (!isNaN(v)) onMinChange(Math.min(v, maxValue))
            }}
            className={fieldBoxInputCls}
          />
        </FieldBox>
        <FieldBox label="Max">
          <input
            type="number"
            value={maxValue}
            min={minValue}
            max={max}
            step={step}
            onChange={(e) => {
              const v = Number(e.target.value)
              if (!isNaN(v)) onMaxChange(Math.max(v, minValue))
            }}
            className={fieldBoxInputCls}
          />
        </FieldBox>
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
