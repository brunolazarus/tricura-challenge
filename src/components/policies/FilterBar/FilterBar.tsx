import { Search, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FilterModal } from "../FilterModal/FilterModal";
import { useFilterPresenter, type FilterChip } from "./FilterBar.presenter";

export function FilterBar() {
  const {
    searchValue,
    onSearchChange,
    chips,
    onDismissChip,
    onClearAll,
    activeCount,
    hasAnyFilter,
    modalOpen,
    modalSession,
    openModal,
    onModalOpenChange,
    currentFilters,
    onApply,
  } = useFilterPresenter();

  return (
    <>
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border bg-white min-h-12 flex-wrap">
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5 h-8 w-44 sm:w-56 border border-border rounded-md px-2.5 bg-background focus-within:ring-1 focus-within:ring-ring transition-shadow">
            <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <input
              type="text"
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search accounts by name…"
              className="flex-1 min-w-0 text-sm bg-transparent outline-none placeholder:text-muted-foreground text-foreground"
            />
          </div>

          <Button
            variant="outline"
            size="sm"
            className="shrink-0 gap-1.5 text-xs font-semibold tracking-wide h-8 px-3"
            onClick={openModal}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            FILTERS
            {activeCount > 0 && (
              <span className="text-primary font-bold">· {activeCount}</span>
            )}
          </Button>
        </div>

        <div className="flex items-center gap-1.5 flex-1 min-w-0 flex-wrap">
          {chips.map((chip) => (
            <Chip
              key={chip.key}
              chip={chip}
              onDismiss={() => onDismissChip(chip.key)}
            />
          ))}
        </div>

        {hasAnyFilter && (
          <Button
            variant="ghost"
            size="sm"
            className="shrink-0 text-xs font-semibold tracking-wide text-muted-foreground hover:text-foreground h-8 px-2"
            onClick={onClearAll}
          >
            CLEAR ALL
          </Button>
        )}
      </div>

      <FilterModal
        open={modalOpen}
        onOpenChange={onModalOpenChange}
        sessionKey={modalSession}
        currentFilters={currentFilters}
        onApply={onApply}
      />
    </>
  );
}

function Chip({
  chip,
  onDismiss,
}: {
  chip: FilterChip;
  onDismiss: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/5 text-primary text-xs font-medium px-2.5 py-0.5 whitespace-nowrap">
      {chip.label}
      <button
        onClick={onDismiss}
        className="ml-0.5 rounded-full hover:bg-primary/20 p-0.5 transition-colors"
        aria-label={`Remove filter: ${chip.label}`}
      >
        <X className="h-3 w-3" />
      </button>
    </span>
  );
}
