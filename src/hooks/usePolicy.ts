import { useSuspenseQuery } from '@tanstack/react-query'
import { getPolicy } from '@/api/policies'

export function usePolicy(id: string) {
  return useSuspenseQuery({
    queryKey: ['policy', id],
    queryFn: () => getPolicy(id),
    staleTime: 60_000,
  })
}
