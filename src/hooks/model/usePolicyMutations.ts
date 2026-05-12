import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { createPolicy, updatePolicy, deletePolicy } from '@/api/policies'
import type { CreatePolicyPayload } from '@/types/policy'

function toastError(error: unknown) {
  const err = error as { response?: { data?: { error?: { code?: string } } }; message?: string }
  const code = err.response?.data?.error?.code
  toast.error(code ?? err.message ?? 'Unexpected error')
}

export function useCreatePolicy() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreatePolicyPayload) => createPolicy(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['policies'] })
      toast.success('Policy created')
    },
    onError: toastError,
  })
}

export function useUpdatePolicy(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreatePolicyPayload) => updatePolicy(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['policies'] })
      queryClient.invalidateQueries({ queryKey: ['policy', id] })
      toast.success('Policy updated')
    },
    onError: toastError,
  })
}

export function useDeletePolicy(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => deletePolicy(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['policies'] })
      queryClient.removeQueries({ queryKey: ['policy', id] })
      toast.success('Policy deleted')
    },
    onError: toastError,
  })
}
