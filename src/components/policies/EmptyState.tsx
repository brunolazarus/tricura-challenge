import { FileX } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'

interface Props {
  hasFilters: boolean
}

export function EmptyState({ hasFilters }: Props) {
  const [, setSearchParams] = useSearchParams()

  return (
    <div className="flex flex-col items-center justify-center h-64 gap-3 text-center px-4">
      <FileX className="h-8 w-8 text-muted-foreground" />
      {hasFilters ? (
        <>
          <p className="text-sm font-medium text-foreground">No policies match your filters</p>
          <Button variant="outline" size="sm" onClick={() => setSearchParams({}, { replace: true })}>
            Clear filters
          </Button>
        </>
      ) : (
        <p className="text-sm font-medium text-foreground">No policies yet</p>
      )}
    </div>
  )
}
