import { Suspense } from "react";
import { XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PolicyForm } from "../PolicyForm/PolicyForm";
import {
  useDrawerState,
  useCreatePresenter,
  useEditPresenter,
} from "./PolicyDrawer.presenter";

export function PolicyDrawer() {
  const { isOpen, isEditMode, isNewMode, expandedId, close } = useDrawerState();

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) close();
      }}
    >
      <DialogContent
        className="max-w-252 max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden"
        showCloseButton={false}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <DialogTitle className="text-base font-semibold">
            {isEditMode ? "Edit Policy" : "Create New Policy"}
          </DialogTitle>
          <button
            onClick={close}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Close"
          >
            <XIcon className="h-4 w-4" />
          </button>
        </div>

        {isNewMode && <CreateForm onClose={close} />}

        {isEditMode && expandedId && (
          <ErrorBoundary
            fallback={(error, reset) => (
              <div className="flex-1 flex flex-col items-center justify-center gap-3 px-6 text-center">
                <p className="text-sm font-medium text-foreground">
                  Failed to load policy
                </p>
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
      </DialogContent>
    </Dialog>
  );
}

function CreateForm({ onClose }: { onClose: () => void }) {
  const { submitLabel, isSubmitting, onSubmit, onCancel } =
    useCreatePresenter(onClose);
  return (
    <PolicyForm
      onSubmit={onSubmit}
      onCancel={onCancel}
      isSubmitting={isSubmitting}
      submitLabel={submitLabel}
    />
  );
}

function EditForm({ id, onClose }: { id: string; onClose: () => void }) {
  const {
    accountStrip,
    defaultValues,
    submitLabel,
    isSubmitting,
    isDeleting,
    confirmDelete,
    setConfirmDelete,
    onSubmit,
    onCancel,
    onDeleteRequest,
    onDeleteConfirm,
    policy,
  } = useEditPresenter(id, onClose);

  return (
    <>
      <div className="flex items-center justify-between px-6 py-2 border-b border-border bg-muted/30 shrink-0">
        <p className="text-sm font-medium text-foreground">
          {accountStrip.name}
        </p>
        <p className="text-xs text-muted-foreground">{accountStrip.id}</p>
      </div>

      <PolicyForm
        defaultValues={defaultValues}
        onSubmit={onSubmit}
        onCancel={onCancel}
        onDelete={onDeleteRequest}
        isSubmitting={isSubmitting}
        submitLabel={submitLabel}
      />

      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Policy</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground px-0.5">
            Delete{" "}
            <span className="font-medium text-foreground">
              {policy.account.name}
            </span>
            ? This cannot be undone.
          </p>
          <DialogFooter showCloseButton={false}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setConfirmDelete(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={onDeleteConfirm}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function EditFormSkeleton() {
  return (
    <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="h-3 w-24" />
          <div className="grid grid-cols-2 gap-3">
            <Skeleton className="h-12 w-full rounded-lg" />
            <Skeleton className="h-12 w-full rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}
