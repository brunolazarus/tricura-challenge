import { usePolicyModel } from '@/hooks/model/usePolicyModel'
import type { PendingReview } from '@/types/policy'

export type RenewalUrgency = 'overdue' | 'urgent' | 'normal'

export interface PolicyPresenterResult {
  policy: ReturnType<typeof usePolicyModel>['data']
  renewalUrgency: RenewalUrgency
  sortedReviews: PendingReview[]
}

export function usePolicyPresenter(id: string): PolicyPresenterResult {
  const { data: policy } = usePolicyModel(id)

  const days = policy.renewal.daysUntilRenewal
  const renewalUrgency: RenewalUrgency =
    days <= 0 ? 'overdue' : days <= 30 ? 'urgent' : 'normal'

  const sortedReviews = [...policy.compliance.pendingReviews].sort(
    (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(),
  )

  return { policy, renewalUrgency, sortedReviews }
}
