import { Suspense, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { XIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ErrorBoundary } from '@/components/ui/error-boundary'
import { Skeleton } from '@/components/ui/skeleton'
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { PolicyForm, policyToFormValues } from './PolicyForm'
import { usePolicy } from '@/hooks/usePolicy'
import { createPolicy, deletePolicy, updatePolicy } from '@/api/policies'
import type { CreatePolicyPayload } from '@/types/policy'

export function PolicyDrawer() {
  const [searchParams, setSearchParams] = useSearchParams()
  const expandedId = searchParams.get('policy')
  const isEditMode = searchParams.has('edit') && !!expandedId
  const isNewMode = searchParams.has('new')
  const isOpen = isEditMode || isNewMode

  function close() {
    const next = new URLSearchParams(searchParams)
    next.delete('edit')
    next.delete('new')
    setSearchParams(next, { replace: true })
  }

  return (
    <Sheet open={isOpen} onOpenChange={(open) => { if (!open) close() }}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{isEditMode ? 'Edit Policy' : 'New Policy'}</SheetTitle>
          <SheetClose
            render={
              <Button variant="ghost" size="icon-sm" className="text-muted-foreground" />
            }
          >
            <XIcon className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </SheetClose>
        </SheetHeader>

        {isNewMode && <CreateForm onClose={close} />}

        {isEditMode && expandedId && (
          <ErrorBoundary
            fallback={(error, reset) => (
              <div className="flex-1 flex flex-col items-center justify-center gap-3 px-6 text-center">
                <p className="text-sm font-medium text-foreground">Failed to load policy</p>
                <p className="text-xs text-muted-foreground">{error.message}</p>
                <Button variant="outline" size="sm" onClick={reset}>
                  Retry
                </Button>
              </div>
            )}
          >
            <Suspense fallback={<EditFormSkeleton />}>
              <EditForm id={expandedId} onClose={close} />
            </Suspense>
          </ErrorBoundary>
        )}
      </SheetContent>
    </Sheet>
  )
}

function CreateForm({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: (payload: CreatePolicyPayload) => createPolicy(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['policies'] })
      toast.success('Policy created')
      onClose()
    },
    onError: (error: Error) => toast.error(error.message),
  })

  return (
    <PolicyForm
      onSubmit={(payload) => mutation.mutateAsync(payload)}
      onCancel={onClose}
      isSubmitting={mutation.isPending}
    />
  )
}

function EditForm({ id, onClose }: { id: string; onClose: () => void }) {
  const queryClient = useQueryClient()
  const { data: policy } = usePolicy(id)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const updateMutation = useMutation({
    mutationFn: (payload: CreatePolicyPayload) => updatePolicy(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['policies'] })
      queryClient.invalidateQueries({ queryKey: ['policy', id] })
      toast.success('Policy updated')
      onClose()
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const deleteMutation = useMutation({
    mutationFn: () => deletePolicy(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['policies'] })
      queryClient.removeQueries({ queryKey: ['policy', id] })
      toast.success('Policy deleted')
      onClose()
    },
    onError: (error: Error) => toast.error(error.message),
  })

  return (
    <>
      <PolicyForm
        defaultValues={policyToFormValues(policy)}
        onSubmit={(payload) => updateMutation.mutateAsync(payload)}
        onCancel={onClose}
        onDelete={() => setConfirmDelete(true)}
        isSubmitting={updateMutation.isPending}
      />

      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Policy</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground px-0.5">
            Delete <span className="font-medium text-foreground">{policy.account.name}</span>?
            This cannot be undone.
          </p>
          <DialogFooter showCloseButton={false}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setConfirmDelete(false)}
              disabled={deleteMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Deleting…' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

function EditFormSkeleton() {
  return (
    <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      ))}
    </div>
  )
}
