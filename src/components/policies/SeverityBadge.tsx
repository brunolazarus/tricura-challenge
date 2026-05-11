import type { Severity } from '@/types/policy'

const styles: Record<Severity, string> = {
  critical: 'text-red-600',
  high: 'text-orange-500',
  medium: 'text-yellow-600',
  low: 'text-muted-foreground',
}

interface Props {
  severity: Severity
}

export function SeverityBadge({ severity }: Props) {
  return (
    <span className={`text-xs font-semibold ${styles[severity]}`}>
      · {severity}
    </span>
  )
}
