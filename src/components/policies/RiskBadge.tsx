import { computeRisk } from '@/lib/risk'
import type { RiskLevel } from '@/types/policy'

const colorMap: Record<RiskLevel, string> = {
  High: 'text-red-600',
  Medium: 'text-amber-600',
  Low: 'text-green-600',
}

interface Props {
  reimbursementRisk: number
  showValue?: boolean
}

export function RiskBadge({ reimbursementRisk, showValue = true }: Props) {
  const level = computeRisk(reimbursementRisk)
  return (
    <span className="flex items-center gap-1.5">
      <span className={`font-medium text-sm ${colorMap[level]}`}>{level}</span>
      {showValue && (
        <span className="text-muted-foreground text-sm">{reimbursementRisk.toFixed(2)}</span>
      )}
    </span>
  )
}
