import { useSearchParams } from 'react-router-dom'
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { PolicyRow } from './PolicyRow'
import type { PolicyListItem } from '@/types/policy'

const COLUMNS = [
  { label: '', className: 'w-4' },
  { label: 'Account Name', className: 'min-w-[200px]' },
  { label: 'Region', className: 'w-36' },
  { label: 'Facilities', className: 'w-24 text-right' },
  { label: 'Effective Date', className: 'w-36' },
  { label: 'Premium', className: 'w-32 text-right' },
  { label: 'Claims Total', className: 'w-32 text-right' },
  { label: 'Risk', className: 'w-32' },
]

interface Props {
  policies: PolicyListItem[]
  isLoading: boolean
  limit: number
}

export function PolicyTable({ policies, isLoading, limit }: Props) {
  const [searchParams] = useSearchParams()
  const expandedId = searchParams.get('policy')

  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          {COLUMNS.map((col) => (
            <TableHead
              key={col.label}
              className={`text-xs font-semibold uppercase tracking-wide text-muted-foreground h-10 ${col.className}`}
            >
              {col.label}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading
          ? Array.from({ length: limit }).map((_, i) => <SkeletonRow key={i} />)
          : policies.map((policy) => (
              <PolicyRow
                key={policy.id}
                policy={policy}
                isExpanded={expandedId === policy.id}
              />
            ))}
      </TableBody>
    </Table>
  )
}

function SkeletonRow() {
  return (
    <TableRow className="hover:bg-transparent">
      <TableHead className="w-4" />
      <TableHead>
        <div className="space-y-1.5">
          <Skeleton className="h-3.5 w-36" />
          <Skeleton className="h-3 w-20" />
        </div>
      </TableHead>
      <TableHead>
        <Skeleton className="h-5 w-20 rounded-full" />
      </TableHead>
      <TableHead className="text-right">
        <Skeleton className="h-3.5 w-6 ml-auto" />
      </TableHead>
      <TableHead>
        <Skeleton className="h-3.5 w-24" />
      </TableHead>
      <TableHead className="text-right">
        <Skeleton className="h-3.5 w-16 ml-auto" />
      </TableHead>
      <TableHead className="text-right">
        <Skeleton className="h-3.5 w-16 ml-auto" />
      </TableHead>
      <TableHead>
        <Skeleton className="h-3.5 w-20" />
      </TableHead>
    </TableRow>
  )
}
