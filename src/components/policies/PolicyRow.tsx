import { useSearchParams } from 'react-router-dom'
import { TableCell, TableRow } from '@/components/ui/table'
import { RiskBadge } from './RiskBadge'
import { formatDate, formatMoney } from '@/lib/format'
import type { PolicyListItem } from '@/types/policy'

interface Props {
  policy: PolicyListItem
  isExpanded: boolean
}

export function PolicyRow({ policy, isExpanded }: Props) {
  const [searchParams, setSearchParams] = useSearchParams()

  function toggleExpand() {
    const next = new URLSearchParams(searchParams)
    if (isExpanded) {
      next.delete('policy')
      next.delete('edit')
    } else {
      next.set('policy', policy.id)
      next.delete('edit')
    }
    setSearchParams(next, { replace: true })
  }

  return (
    <TableRow
      onClick={toggleExpand}
      data-expanded={isExpanded}
      className={`cursor-pointer transition-colors ${
        isExpanded ? 'bg-blue-50 hover:bg-blue-50' : 'hover:bg-muted/40'
      }`}
    >
      <TableCell className="w-4 pl-4">
        <span className="text-muted-foreground text-xs">·</span>
      </TableCell>

      <TableCell className="py-3">
        <div>
          <p className="font-medium text-sm text-foreground leading-tight">{policy.accountName}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{policy.id}</p>
        </div>
      </TableCell>

      <TableCell>
        <span className="inline-flex items-center rounded-full border border-border px-2.5 py-0.5 text-xs font-medium text-foreground">
          {policy.region}
        </span>
      </TableCell>

      <TableCell className="text-sm tabular-nums text-right">{policy.facilityCount}</TableCell>

      <TableCell className="text-sm tabular-nums">{formatDate(policy.effectiveDate)}</TableCell>

      <TableCell className="text-sm tabular-nums text-right">
        {formatMoney(policy.premium)}
      </TableCell>

      <TableCell className="text-sm tabular-nums text-right">
        {formatMoney(policy.claimsTotal)}
      </TableCell>

      <TableCell>
        <RiskBadge reimbursementRisk={policy.reimbursementRisk} />
      </TableCell>
    </TableRow>
  )
}
