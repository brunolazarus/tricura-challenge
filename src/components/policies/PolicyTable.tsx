import { Fragment } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { PolicyRow } from "./PolicyRow";
import { PolicyExpandedRow } from "./PolicyExpandedRow/PolicyExpandedRow";
import type { PolicyListItem } from "@/types/policy";

const COLUMNS = [
  { label: "", className: "w-4" },
  { label: "Account Name", className: "min-w-[200px]" },
  { label: "Region", className: "w-36" },
  { label: "Facilities", className: "w-24 text-right" },
  { label: "Effective Date", className: "w-36" },
  { label: "Premium", className: "w-32 text-right" },
  { label: "Claims Total", className: "w-32 text-right" },
  { label: "Risk", className: "w-36" },
];

interface Props {
  policies: PolicyListItem[];
}

export function PolicyTable({ policies }: Props) {
  const [searchParams] = useSearchParams();
  const expandedId = searchParams.get("policy");

  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          {COLUMNS.map((col) => (
            <TableHead
              key={col.label}
              className={`text-xs font-semibold uppercase tracking-wide text-muted-foreground h-10 ${col.className}`}
            >
              {col.label}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {policies.map((policy) => (
          <Fragment key={policy.id}>
            <PolicyRow policy={policy} isExpanded={expandedId === policy.id} />
            {expandedId === policy.id && <PolicyExpandedRow id={policy.id} />}
          </Fragment>
        ))}
      </TableBody>
    </Table>
  );
}

export function PolicyTableSkeleton({ limit }: { limit: number }) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          {COLUMNS.map((col) => (
            <TableHead
              key={col.label}
              className={`text-xs font-semibold uppercase tracking-wide text-muted-foreground h-10 ${col.className}`}
            >
              {col.label}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: limit }).map((_, i) => (
          <SkeletonRow key={i} />
        ))}
      </TableBody>
    </Table>
  );
}

function SkeletonRow() {
  return (
    <TableRow className="hover:bg-transparent">
      <TableCell className="w-4 pl-4" />
      <TableCell className="py-3">
        <div className="space-y-1.5">
          <Skeleton className="h-3.5 w-36" />
          <Skeleton className="h-3 w-20" />
        </div>
      </TableCell>
      <TableCell>
        <Skeleton className="h-5 w-20 rounded-full" />
      </TableCell>
      <TableCell className="text-right">
        <Skeleton className="h-3.5 w-6 ml-auto" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-3.5 w-24" />
      </TableCell>
      <TableCell className="text-right">
        <Skeleton className="h-3.5 w-16 ml-auto" />
      </TableCell>
      <TableCell className="text-right">
        <Skeleton className="h-3.5 w-16 ml-auto" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-3.5 w-20" />
      </TableCell>
    </TableRow>
  );
}
