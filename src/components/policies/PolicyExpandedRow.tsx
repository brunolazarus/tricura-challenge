import { Suspense } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AlertCircle } from 'lucide-react'
import { TableCell, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ErrorBoundary } from '@/components/ui/error-boundary'
import { RiskBar } from './RiskBar'
import { SeverityBadge } from './SeverityBadge'
import { usePolicy } from '@/hooks/usePolicy'
import { formatDate, formatMoney } from '@/lib/format'
import type { Policy } from '@/types/policy'

const COL_SPAN = 8

interface Props {
  id: string
}

export function PolicyExpandedRow({ id }: Props) {
  return (
    <TableRow className="bg-blue-50 hover:bg-blue-50 border-b border-blue-100">
      <TableCell colSpan={COL_SPAN} className="p-0">
        <ErrorBoundary
          fallback={(error, reset) => (
            <ExpandedError message={error.message} onRetry={reset} />
          )}
        >
          <Suspense fallback={<ExpandedSkeleton />}>
            <ExpandedDetail id={id} />
          </Suspense>
        </ErrorBoundary>
      </TableCell>
    </TableRow>
  )
}

function ExpandedDetail({ id }: { id: string }) {
  const { data: policy } = usePolicy(id)
  return <ExpandedContent policy={policy} />
}

function ExpandedContent({ policy }: { policy: Policy }) {
  const [searchParams, setSearchParams] = useSearchParams()

  function handleEdit() {
    const next = new URLSearchParams(searchParams)
    next.set('edit', 'true')
    setSearchParams(next, { replace: true })
  }

  const { account, renewal, compliance, financials } = policy

  return (
    <div className="grid grid-cols-[1fr_1.4fr_1.6fr] divide-x divide-blue-100 px-0">
      {/* Panel 1 — Renewal & Account */}
      <div className="px-6 py-4 space-y-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Renewal &amp; Account
        </p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
          <DetailField label="Effective" value={formatDate(renewal.effectiveDate)} />
          <DetailField label="Days to Renewal" value={String(renewal.daysUntilRenewal)} />
          <DetailField label="Region" value={account.region} />
          <DetailField label="Facilities" value={String(account.facilityCount)} />
        </div>
      </div>

      {/* Panel 2 — Financials */}
      <div className="px-6 py-4 space-y-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Financials
        </p>
        <div className="grid grid-cols-2 gap-x-4">
          <DetailField label="Premium" value={formatMoney(financials.premium)} valueLarge />
          <DetailField label="Claims" value={formatMoney(financials.claimsTotal)} valueLarge />
        </div>
        <RiskBar reimbursementRisk={financials.reimbursementRisk} />
      </div>

      {/* Panel 3 — Compliance */}
      <div className="px-6 py-4 space-y-3 relative">
        <div className="flex items-start justify-between gap-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Compliance
            <span className="font-normal normal-case">
              {' · '}
              <span className="text-foreground font-medium">{compliance.missingDocuments}</span>
              {' missing · '}
              <span className="text-foreground font-medium">{compliance.expiredDocuments}</span>
              {' expired'}
            </span>
          </p>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs font-semibold tracking-wide text-primary hover:text-primary shrink-0"
            onClick={handleEdit}
          >
            EDIT
          </Button>
        </div>

        {compliance.pendingReviews.length === 0 ? (
          <p className="text-xs text-muted-foreground">No pending reviews</p>
        ) : (
          <div className="space-y-2">
            {compliance.pendingReviews.map((review, i) => (
              <div key={i}>
                {i > 0 && <Separator className="mb-2 bg-blue-100" />}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium text-foreground leading-tight">
                      {review.type}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Due {formatDate(review.dueDate, 'MMM d')}
                    </p>
                  </div>
                  <SeverityBadge severity={review.severity} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function DetailField({
  label,
  value,
  valueLarge,
}: {
  label: string
  value: string
  valueLarge?: boolean
}) {
  return (
    <div>
      <p className="text-xs text-muted-foreground uppercase tracking-wide">{label}</p>
      <p className={`font-medium text-foreground mt-0.5 ${valueLarge ? 'text-lg' : 'text-sm'}`}>
        {value}
      </p>
    </div>
  )
}

function ExpandedSkeleton() {
  return (
    <div className="grid grid-cols-[1fr_1.4fr_1.6fr] divide-x divide-blue-100 px-0">
      {[0, 1, 2].map((i) => (
        <div key={i} className="px-6 py-4 space-y-3">
          <Skeleton className="h-3 w-24" />
          <div className="grid grid-cols-2 gap-3">
            {[0, 1, 2, 3].map((j) => (
              <div key={j} className="space-y-1.5">
                <Skeleton className="h-2.5 w-16" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function ExpandedError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex items-center gap-3 px-6 py-4">
      <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
      <p className="text-sm text-muted-foreground">{message}</p>
      <Button variant="outline" size="sm" onClick={onRetry} className="ml-auto">
        Retry
      </Button>
    </div>
  )
}
