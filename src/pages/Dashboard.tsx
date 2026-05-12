import { Suspense } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { FilterBar } from "@/components/policies/FilterBar/FilterBar";
import {
  PolicyTable,
  PolicyTableSkeleton,
} from "@/components/policies/PolicyTable";
import { PolicyDrawer } from "@/components/policies/PolicyDrawer/PolicyDrawer";
import { Pagination } from "@/components/policies/Footer/Pagination";
import { ErrorState } from "@/components/boundary/ErrorState";
import { EmptyState } from "@/components/boundary/EmptyState";
import { usePoliciesPresenter } from "./Dashboard.presenter";
import { useFilterModel } from "@/hooks/model/useFilterModel";

export function Dashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { limit } = useFilterModel();

  function openNewPolicy() {
    const next = new URLSearchParams(searchParams);
    next.set("new", "true");
    next.delete("policy");
    next.delete("edit");
    setSearchParams(next, { replace: true });
  }

  return (
    <div className="flex flex-col h-full">
      <FilterBar />

      <div className="flex flex-col flex-1 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-white shrink-0">
          <h1 className="text-base font-semibold text-foreground">Policies</h1>
          <Button
            size="sm"
            className="text-xs font-semibold tracking-wide"
            onClick={openNewPolicy}
          >
            + NEW POLICY
          </Button>
        </div>

        <ErrorBoundary
          fallback={(error, reset) => (
            <div className="flex-1 overflow-auto bg-white">
              <ErrorState message={error.message} onRetry={reset} />
            </div>
          )}
        >
          <Suspense
            fallback={
              <div className="flex-1 overflow-auto bg-white">
                <PolicyTableSkeleton limit={limit} />
              </div>
            }
          >
            <PoliciesSection />
          </Suspense>
        </ErrorBoundary>
      </div>

      <PolicyDrawer />
    </div>
  );
}

function PoliciesSection() {
  const { policies, pagination, isEmpty, hasAnyFilter } =
    usePoliciesPresenter();

  return (
    <>
      <div className="flex-1 overflow-auto bg-white">
        {isEmpty ? (
          <EmptyState hasFilters={hasAnyFilter} />
        ) : (
          <PolicyTable policies={policies} />
        )}
      </div>
      <div className="shrink-0">
        <Pagination pagination={pagination} />
      </div>
    </>
  );
}
