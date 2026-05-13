import { Suspense } from "react";
import { useSearchParams } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { RiskBar } from "../RiskBar";
import { SeverityBadge } from "../SeverityBadge";
import {
  usePolicyPresenter,
  type RenewalUrgency,
} from "./PolicyExpandedRow.presenter";
import { formatDate, formatMoney } from "@/lib/format";
import type { Policy, PendingReview } from "@/types/policy";

const COL_SPAN = 8;

export function PolicyExpandedRow({ id }: { id: string }) {
  return (
    <TableRow className="bg-blue-50 hover:bg-blue-50 border-b border-blue-100">
      <TableCell colSpan={COL_SPAN} className="p-0">
        <ErrorBoundary
          fallback={(error, reset) => (
            <ExpandedError message={error.message} onRetry={reset} />
          )}
        >
          <Suspense fallback={<ExpandedSkeleton />}>
            <ExpandedDetail id={id} />
          </Suspense>
        </ErrorBoundary>
      </TableCell>
    </TableRow>
  );
}

function ExpandedDetail({ id }: { id: string }) {
  const { policy, renewalUrgency, sortedReviews } = usePolicyPresenter(id);
  return (
    <ExpandedContent
      policy={policy}
      renewalUrgency={renewalUrgency}
      sortedReviews={sortedReviews}
    />
  );
}

function ExpandedContent({
  policy,
  renewalUrgency,
  sortedReviews,
}: {
  policy: Policy;
  renewalUrgency: RenewalUrgency;
  sortedReviews: PendingReview[];
}) {
  const [searchParams, setSearchParams] = useSearchParams();

  function handleEdit() {
    const next = new URLSearchParams(searchParams);
    next.set("edit", "true");
    setSearchParams(next, { replace: true });
  }

  const { account, renewal, compliance, financials } = policy;

  const daysColor =
    renewalUrgency === "overdue"
      ? "text-destructive"
      : renewalUrgency === "urgent"
        ? "text-amber-600"
        : "text-foreground";

  return (
    <div className="grid grid-cols-1 md:grid-cols-[1fr_1.4fr_1.6fr] divide-y md:divide-y-0 md:divide-x divide-blue-100 px-0">
      {/* Panel 1 — Renewal & Account */}
      <div className="px-6 py-4 space-y-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Renewal &amp; Account
        </p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
          <DetailField
            label="Effective"
            value={formatDate(renewal.effectiveDate)}
          />
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              Days to Renewal
            </p>
            <p className={`font-medium text-sm mt-0.5 ${daysColor}`}>
              {renewal.daysUntilRenewal <= 0
                ? `${Math.abs(renewal.daysUntilRenewal)}d overdue`
                : `${renewal.daysUntilRenewal}`}
            </p>
          </div>
          <DetailField label="Region" value={account.region} />
          <DetailField
            label="Facilities"
            value={String(account.facilityCount)}
          />
        </div>
      </div>

      {/* Panel 2 — Financials */}
      <div className="px-6 py-4 space-y-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Financials
        </p>
        <div className="grid grid-cols-2 gap-x-4">
          <DetailField
            label="Premium"
            value={formatMoney(financials.premium)}
            valueLarge
          />
          <DetailField
            label="Claims"
            value={formatMoney(financials.claimsTotal)}
            valueLarge
          />
        </div>
        <RiskBar reimbursementRisk={financials.reimbursementRisk} />
      </div>

      {/* Panel 3 — Compliance */}
      <div className="px-6 py-4 space-y-3 relative">
        <div className="flex items-start justify-between gap-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Compliance
            <span className="font-normal normal-case">
              {" · "}
              <span className="text-foreground font-medium">
                {compliance.missingDocuments}
              </span>
              {" missing · "}
              <span className="text-foreground font-medium">
                {compliance.expiredDocuments}
              </span>
              {" expired"}
            </span>
          </p>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs font-semibold tracking-wide text-primary hover:text-primary shrink-0"
            onClick={handleEdit}
          >
            EDIT
          </Button>
        </div>

        {sortedReviews.length === 0 ? (
          <p className="text-xs text-muted-foreground">No pending reviews</p>
        ) : (
          <div className="space-y-2">
            {sortedReviews.map((review, i) => (
              <div key={i}>
                {i > 0 && <Separator className="mb-2 bg-blue-100" />}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium text-foreground leading-tight">
                      {review.type}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Due {formatDate(review.dueDate, "MMM d")}
                    </p>
                  </div>
                  <SeverityBadge severity={review.severity} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function DetailField({
  label,
  value,
  valueLarge,
}: {
  label: string;
  value: string;
  valueLarge?: boolean;
}) {
  return (
    <div>
      <p className="text-xs text-muted-foreground uppercase tracking-wide">
        {label}
      </p>
      <p
        className={`font-medium text-foreground mt-0.5 ${valueLarge ? "text-lg" : "text-sm"}`}
      >
        {value}
      </p>
    </div>
  );
}

function ExpandedSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-[1fr_1.4fr_1.6fr] divide-y md:divide-y-0 md:divide-x divide-blue-100 px-0">
      {[0, 1, 2].map((i) => (
        <div key={i} className="px-6 py-4 space-y-3">
          <Skeleton className="h-3 w-24" />
          <div className="grid grid-cols-2 gap-3">
            {[0, 1, 2, 3].map((j) => (
              <div key={j} className="space-y-1.5">
                <Skeleton className="h-2.5 w-16" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function ExpandedError({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-10 gap-3 text-center px-4 min-h-40">
      <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
        <AlertCircle className="h-6 w-6 text-destructive" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-semibold text-foreground">
          Couldn&apos;t load policy details
        </p>
        <p className="text-xs text-muted-foreground">
          Something went wrong, try again in a moment.
        </p>
      </div>
      <code className="text-xs bg-muted text-foreground px-2 py-1 rounded-md font-mono border border-border">
        {message}
      </code>
      <Button
        size="sm"
        onClick={onRetry}
        className="text-xs font-semibold tracking-wide"
      >
        RETRY
      </Button>
    </div>
  );
}
