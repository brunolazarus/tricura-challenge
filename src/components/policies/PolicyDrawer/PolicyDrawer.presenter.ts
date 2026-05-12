import { useState } from 'react'
import { useLocation, useSearchParams } from 'react-router-dom'
import { usePolicyModel } from '@/hooks/model/usePolicyModel'
import {
  useCreatePolicy,
  useUpdatePolicy,
  useDeletePolicy,
} from '@/hooks/model/usePolicyMutations'
import { policyToFormValues } from '../PolicyForm/PolicyForm.presenter'
import type { CreatePolicyPayload } from '@/types/policy'

// ── URL state only — no suspense, called by the Dialog shell ──────────────────

export function useDrawerState() {
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()

  const expandedId = searchParams.get('policy')
  const isEditMode = searchParams.has('edit') && !!expandedId
  const isNewMode =
    searchParams.has('new') || location.pathname === '/policies/new'

  function close() {
    const next = new URLSearchParams(searchParams)
    next.delete('edit')
    next.delete('new')
    setSearchParams(next, { replace: true })
  }

  return {
    isOpen: isEditMode || isNewMode,
    isEditMode,
    isNewMode,
    expandedId: expandedId ?? '',
    close,
  }
}

// ── Create mode — no suspense ─────────────────────────────────────────────────

export function useCreatePresenter(onClose: () => void) {
  const mutation = useCreatePolicy()
  return {
    submitLabel: 'CREATE POLICY' as const,
    isSubmitting: mutation.isPending,
    onSubmit: async (payload: CreatePolicyPayload) => {
      await mutation.mutateAsync(payload)
      onClose()
    },
    onCancel: onClose,
  }
}

// ── Edit mode — suspends via usePolicyModel, must be inside <Suspense> ────────

export function useEditPresenter(id: string, onClose: () => void) {
  const { data: policy } = usePolicyModel(id)
  const updateMutation = useUpdatePolicy(id)
  const deleteMutation = useDeletePolicy(id)
  const [confirmDelete, setConfirmDelete] = useState(false)

  return {
    policy,
    accountStrip: { name: policy.account.name, id },
    defaultValues: policyToFormValues(policy),
    submitLabel: 'SAVE CHANGES' as const,
    isSubmitting: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    confirmDelete,
    setConfirmDelete,
    onSubmit: async (payload: CreatePolicyPayload) => {
      await updateMutation.mutateAsync(payload)
      onClose()
    },
    onCancel: onClose,
    onDeleteRequest: () => setConfirmDelete(true),
    onDeleteConfirm: () => deleteMutation.mutate(),
  }
}

