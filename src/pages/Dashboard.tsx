import { useSearchParams } from 'react-router-dom'
import { AlertCircle, FileX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PolicyTable } from '@/components/policies/PolicyTable'
import { Pagination } from '@/components/policies/Pagination'
import { usePolicies } from '@/hooks/usePolicies'
import type { PolicyListParams } from '@/types/policy'

export function Dashboard() {
  const [searchParams] = useSearchParams()

  const page = Math.max(1, Number(searchParams.get('page') ?? '1'))
  const limit = Number(searchParams.get('limit') ?? '20')

  const filters: PolicyListParams = {
    page,
    limit,
    search: searchParams.get('search') ?? undefined,
    region: (searchParams.get('region') as PolicyListParams['region']) ?? undefined,
    effectiveDateFrom: searchParams.get('effectiveDateFrom') ?? undefined,
    effectiveDateTo: searchParams.get('effectiveDateTo') ?? undefined,
    reimbursementRiskMin: searchParams.get('riskMin') ? Number(searchParams.get('riskMin')) : undefined,
    reimbursementRiskMax: searchParams.get('riskMax') ? Number(searchParams.get('riskMax')) : undefined,
    premiumMin: searchParams.get('premiumMin') ? Number(searchParams.get('premiumMin')) : undefined,
    premiumMax: searchParams.get('premiumMax') ? Number(searchParams.get('premiumMax')) : undefined,
    claimsTotalMin: searchParams.get('claimsMin') ? Number(searchParams.get('claimsMin')) : undefined,
    claimsTotalMax: searchParams.get('claimsMax') ? Number(searchParams.get('claimsMax')) : undefined,
  }

  const { data, isLoading, isError, error, refetch } = usePolicies(filters)

  return (
    <div className="flex flex-col h-full">
      {/* Top filter bar — placeholder until Phase 2 */}
      <div className="border-b border-border bg-white px-4 py-2 flex items-center gap-3 shrink-0">
        <input
          readOnly
          placeholder="Search accounts by name…"
          className="flex-1 max-w-xs text-sm text-muted-foreground bg-transparent outline-none cursor-not-allowed placeholder:text-muted-foreground"
        />
      </div>

      {/* Content area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Table header row */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-white shrink-0">
          <h1 className="text-base font-semibold text-foreground">Policies</h1>
          <Button size="sm" className="text-xs font-semibold tracking-wide">
            + NEW POLICY
          </Button>
        </div>

        {/* Main table area */}
        <div className="flex-1 overflow-auto bg-white">
          {isError ? (
            <ErrorState message={(error as Error).message} onRetry={() => refetch()} />
          ) : data?.data.length === 0 && !isLoading ? (
            <EmptyState hasFilters={hasActiveFilters(filters)} />
          ) : (
            <PolicyTable
              policies={data?.data ?? []}
              isLoading={isLoading}
              limit={limit}
            />
          )}
        </div>

        {/* Pagination */}
        {data?.pagination && !isError && (
          <div className="shrink-0">
            <Pagination pagination={data.pagination} />
          </div>
        )}
      </div>
    </div>
  )
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-64 gap-3 text-center px-4">
      <AlertCircle className="h-8 w-8 text-destructive" />
      <p className="text-sm font-medium text-foreground">Failed to load policies</p>
      <p className="text-xs text-muted-foreground max-w-sm">{message}</p>
      <Button variant="outline" size="sm" onClick={onRetry}>
        Retry
      </Button>
    </div>
  )
}

function EmptyState({ hasFilters }: { hasFilters: boolean }) {
  const [, setSearchParams] = useSearchParams()

  function clearFilters() {
    setSearchParams({}, { replace: true })
  }

  return (
    <div className="flex flex-col items-center justify-center h-64 gap-3 text-center px-4">
      <FileX className="h-8 w-8 text-muted-foreground" />
      {hasFilters ? (
        <>
          <p className="text-sm font-medium text-foreground">No policies match your filters</p>
          <Button variant="outline" size="sm" onClick={clearFilters}>
            Clear filters
          </Button>
        </>
      ) : (
        <p className="text-sm font-medium text-foreground">No policies yet</p>
      )}
    </div>
  )
}

function hasActiveFilters(filters: PolicyListParams): boolean {
  const { page: _p, limit: _l, ...rest } = filters
  return Object.values(rest).some((v) => v !== undefined && v !== '')
}
