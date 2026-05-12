import { computeRisk } from "@/lib/risk";
import type { RiskLevel } from "@/types/policy";

const barColor: Record<RiskLevel, string> = {
  High: "bg-red-500",
  Medium: "bg-amber-400",
  Low: "bg-green-500",
};

const labelColor: Record<RiskLevel, string> = {
  High: "text-red-600",
  Medium: "text-amber-600",
  Low: "text-green-600",
};

interface Props {
  reimbursementRisk: number;
}

export function RiskBar({ reimbursementRisk }: Props) {
  const level = computeRisk(reimbursementRisk);
  const levelPercent = Math.min(100, reimbursementRisk * 100);

  return (
    <div className="space-y-1.5">
      <p className="text-xs text-muted-foreground">Reimbursement risk</p>
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full ${barColor[level]}`}
            style={{ width: `${levelPercent}%` }}
          />
        </div>
        <span className={`text-xs font-semibold shrink-0 ${labelColor[level]}`}>
          {level}
        </span>
        <span className="text-xs text-muted-foreground shrink-0 tabular-nums">
          {reimbursementRisk.toFixed(2)}
        </span>
      </div>
    </div>
  );
}
