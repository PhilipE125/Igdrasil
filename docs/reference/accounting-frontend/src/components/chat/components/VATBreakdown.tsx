import { cn } from "@/lib/utils";

export interface VATLine {
  id: string;
  label: string;
  taxBase?: number;
  vatRate?: number;
  vatAmount: number;
  isTotal?: boolean;
}

export interface VATBreakdownProps {
  title?: string;
  period?: string;
  lines: VATLine[];
  netPosition?: number;
  dueDate?: string;
}

function fmtSEK(v: number): string {
  return v.toLocaleString("sv-SE") + " SEK";
}

export function VATBreakdown({ title, period, lines, netPosition, dueDate }: VATBreakdownProps) {
  return (
    <div className="my-3 border-y border-border/40 py-3">
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="text-sm font-medium text-foreground">{title ?? "VAT Breakdown"}</p>
          {period && <p className="text-xs text-muted-foreground">{period}</p>}
        </div>
        {dueDate && (
          <span className="text-xs text-muted-foreground bg-muted rounded-md px-2 py-1">Due {dueDate}</span>
        )}
      </div>

      <div className="space-y-1">
        {lines.map((line) => (
          <div
            key={line.id}
            className={cn(
              "flex items-center justify-between rounded-lg px-3 py-2 text-xs",
              line.isTotal
                ? "bg-muted font-semibold text-foreground border border-border"
                : "text-foreground hover:bg-muted/40 transition-colors",
            )}
          >
            <div className="flex-1 min-w-0">
              <span className="text-pretty">{line.label}</span>
              {line.vatRate !== undefined && !line.isTotal && (
                <span className="ml-1.5 text-muted-foreground">({line.vatRate}%)</span>
              )}
            </div>
            <div className="flex items-center gap-6 shrink-0 tabular-nums ml-4">
              {line.taxBase !== undefined && (
                <span className="text-muted-foreground w-28 text-right">
                  {line.taxBase.toLocaleString("sv-SE")}
                </span>
              )}
              <span
                className={cn(
                  "w-28 text-right",
                  line.vatAmount < 0 ? "text-green-600 dark:text-green-400" : "text-foreground",
                )}
              >
                {line.vatAmount >= 0 ? "" : "−"}
                {Math.abs(line.vatAmount).toLocaleString("sv-SE")}
              </span>
            </div>
          </div>
        ))}
      </div>

      {netPosition !== undefined && (
        <div
          className={cn(
            "mt-3 flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-semibold border",
            netPosition >= 0
              ? "bg-red-50 border-red-200 text-red-800 dark:bg-red-950/20 dark:border-red-800 dark:text-red-300"
              : "bg-green-50 border-green-200 text-green-800 dark:bg-green-950/20 dark:border-green-800 dark:text-green-300",
          )}
        >
          <span>{netPosition >= 0 ? "VAT to pay" : "VAT to reclaim"}</span>
          <span className="tabular-nums">{fmtSEK(Math.abs(netPosition))}</span>
        </div>
      )}
    </div>
  );
}
