import { useSearchParams } from 'react-router-dom'
import type { Pagination as PaginationMeta } from '@/types/policy'

export const LIMIT_OPTIONS = [10, 20, 50]

export function buildPageNumbers(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)

  const pages: (number | '...')[] = [1]
  if (current > 3) pages.push('...')

  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)
  for (let i = start; i <= end; i++) pages.push(i)

  if (current < total - 2) pages.push('...')
  pages.push(total)

  return pages
}

export function usePaginationPresenter(pagination: PaginationMeta) {
  const [searchParams, setSearchParams] = useSearchParams()
  const { page, limit, total, totalPages } = pagination

  const from = total === 0 ? 0 : (page - 1) * limit + 1
  const to = Math.min(page * limit, total)
  const pageNumbers = buildPageNumbers(page, totalPages)

  function goToPage(next: number) {
    const params = new URLSearchParams(searchParams)
    params.set('page', String(next))
    setSearchParams(params, { replace: true })
  }

  function setLimit(next: string | null) {
    if (!next) return
    const params = new URLSearchParams(searchParams)
    params.set('limit', next)
    params.set('page', '1')
    setSearchParams(params, { replace: true })
  }

  return {
    page,
    limit,
    total,
    totalPages,
    from,
    to,
    pageNumbers,
    goToPage,
    setLimit,
  }
}
