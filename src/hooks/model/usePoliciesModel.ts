import { useSuspenseQuery } from '@tanstack/react-query'
import { listPolicies } from '@/api/policies'
import type { PolicyListParams } from '@/types/policy'

export function usePoliciesModel(params: PolicyListParams) {
  return useSuspenseQuery({
    queryKey: ['policies', params],
    queryFn: () => listPolicies(params),
  })
}
