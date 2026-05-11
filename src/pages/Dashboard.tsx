import { Suspense } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ErrorBoundary } from '@/components/ui/error-boundary'
import { FilterBar } from '@/components/policies/FilterBar'
import { PolicyTable, PolicyTableSkeleton } from '@/components/policies/PolicyTable'
import { PolicyDrawer } from '@/components/policies/PolicyDrawer'
import { Pagination } from '@/components/policies/Pagination'
import { ErrorState } from '@/components/policies/ErrorState'
import { EmptyState } from '@/components/policies/EmptyState'
import { usePolicies } from '@/hooks/usePolicies'
import { useFilterParams } from '@/hooks/useFilterParams'
import type { PolicyListParams } from '@/types/policy'

export function Dashboard() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { limit, hasAnyFilter, toPolicyListParams } = useFilterParams()

  function openNewPolicy() {
    const next = new URLSearchParams(searchParams)
    next.set('new', 'true')
    next.delete('policy')
    next.delete('edit')
    setSearchParams(next, { replace: true })
  }

  return (
    <div className="flex flex-col h-full">
      <FilterBar />

      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Table header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-white shrink-0">
          <h1 className="text-base font-semibold text-foreground">Policies</h1>
          <Button size="sm" className="text-xs font-semibold tracking-wide" onClick={openNewPolicy}>
            + NEW POLICY
          </Button>
        </div>

        {/* Table + Pagination */}
        <ErrorBoundary
          fallback={(error, reset) => (
            <div className="flex-1 overflow-auto bg-white">
              <ErrorState message={error.message} onRetry={reset} />
            </div>
          )}
        >
          <Suspense
            fallback={
              <div className="flex-1 overflow-auto bg-white">
                <PolicyTableSkeleton limit={limit} />
              </div>
            }
          >
            <PoliciesSection params={toPolicyListParams()} hasAnyFilter={hasAnyFilter} />
          </Suspense>
        </ErrorBoundary>
      </div>

      <PolicyDrawer />
    </div>
  )
}

function PoliciesSection({
  params,
  hasAnyFilter,
}: {
  params: PolicyListParams
  hasAnyFilter: boolean
}) {
  const { data } = usePolicies(params)

  return (
    <>
      <div className="flex-1 overflow-auto bg-white">
        {data.data.length === 0 ? (
          <EmptyState hasFilters={hasAnyFilter} />
        ) : (
          <PolicyTable policies={data.data} />
        )}
      </div>
      <div className="shrink-0">
        <Pagination pagination={data.pagination} />
      </div>
    </>
  )
}
