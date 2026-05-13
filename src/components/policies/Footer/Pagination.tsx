import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { usePaginationPresenter, LIMIT_OPTIONS } from './Pagination.presenter'
import type { Pagination as PaginationMeta } from '@/types/policy'

interface Props {
  pagination: PaginationMeta
}

export function Pagination({ pagination }: Props) {
  const { page, limit, total, totalPages, from, to, pageNumbers, goToPage, setLimit } =
    usePaginationPresenter(pagination)

  return (
    <div className="flex flex-wrap items-center justify-between gap-y-2 px-4 py-3 border-t border-border">
      <div className="flex items-center gap-2 text-sm text-muted-foreground shrink-0">
        <span>Rows per page:</span>
        <Select value={String(limit)} onValueChange={setLimit}>
          <SelectTrigger className="h-7 w-16 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {LIMIT_OPTIONS.map((n) => (
              <SelectItem key={n} value={String(n)}>
                {n}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-1 text-sm flex-wrap justify-end">
        <span className="text-muted-foreground mr-2">
          {from}–{to} of {total}
        </span>

        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          disabled={page <= 1}
          onClick={() => goToPage(page - 1)}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {pageNumbers.map((p, i) =>
          p === '...' ? (
            <span key={`ellipsis-${i}`} className="px-1 text-muted-foreground">
              …
            </span>
          ) : (
            <Button
              key={p}
              variant={p === page ? 'default' : 'ghost'}
              size="icon"
              className="h-7 w-7 text-sm"
              onClick={() => goToPage(p as number)}
            >
              {p}
            </Button>
          ),
        )}

        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          disabled={page >= totalPages}
          onClick={() => goToPage(page + 1)}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
