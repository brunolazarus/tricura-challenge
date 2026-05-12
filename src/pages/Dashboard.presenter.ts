import { useFilterModel } from '@/hooks/model/useFilterModel'
import { usePoliciesModel } from '@/hooks/model/usePoliciesModel'

export function usePoliciesPresenter() {
  const { toPolicyListParams, hasAnyFilter } = useFilterModel()
  const params = toPolicyListParams()
  const { data } = usePoliciesModel(params)

  return {
    policies: data.data,
    pagination: data.pagination,
    isEmpty: data.data.length === 0,
    hasAnyFilter,
  }
}
