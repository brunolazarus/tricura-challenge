import type { RiskLevel } from '@/types/policy'

export function computeRisk(reimbursementRisk: number): RiskLevel {
  if (reimbursementRisk >= 0.7) return 'High'
  if (reimbursementRisk >= 0.4) return 'Medium'
  return 'Low'
}
