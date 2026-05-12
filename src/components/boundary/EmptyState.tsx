import { Search } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'

interface Props {
  hasFilters: boolean
}

export function EmptyState({ hasFilters }: Props) {
  const [searchParams, setSearchParams] = useSearchParams()

  function clearFilters() {
    setSearchParams({}, { replace: true })
  }

  function createNew() {
    const next = new URLSearchParams(searchParams)
    next.set('new', 'true')
    setSearchParams(next, { replace: true })
  }

  return (
    <div className="flex flex-col items-center justify-center h-64 gap-3 text-center px-4">
      <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
        <Search className="h-5 w-5 text-muted-foreground" />
      </div>
      {hasFilters ? (
        <>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-foreground">No policies match these filters</p>
            <p className="text-xs text-muted-foreground">Try widening your search to see more results.</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="text-xs font-semibold tracking-wide"
              onClick={clearFilters}
            >
              CLEAR FILTERS
            </Button>
            <Button
              size="sm"
              className="text-xs font-semibold tracking-wide"
              onClick={createNew}
            >
              + CREATE NEW POLICY
            </Button>
          </div>
        </>
      ) : (
        <p className="text-sm font-semibold text-foreground">No policies yet</p>
      )}
    </div>
  )
}
