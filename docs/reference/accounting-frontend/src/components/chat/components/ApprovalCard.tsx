import { useMemo, useState } from "react";
import { Check, X, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { authenticatedApiRequest } from "@/lib/uploadApi";
import { cn } from "@/lib/utils";

export interface JournalLine {
  account: string;
  account_name?: string;
  debit?: number;
  credit?: number;
  vat_treatment?: string;
  cost_center?: string;
  project?: string;
}

export interface ApprovalCardProps {
  // Correlation id the frontend POSTs back to /api/chat/permission-reply.
  request_id: string;
  tool_name: string;
  title: string;
  description?: string;
  lines?: JournalLine[];
  voucher_series?: string;
  entry_date?: string;
  args?: Record<string, unknown>;
}

const PENNY_EPSILON = 0.005;

function sumAmount(lines: JournalLine[], field: "debit" | "credit"): number {
  return lines.reduce((acc, line) => acc + (line[field] ?? 0), 0);
}

function fmt(v: number): string {
  return v.toLocaleString("sv-SE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function ApprovalCard(props: ApprovalCardProps) {
  const [state, setState] = useState<"idle" | "pending" | "approved" | "rejected" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const hasLines = !!props.lines && props.lines.length > 0;

  const { debitTotal, creditTotal, balanced } = useMemo(() => {
    if (!hasLines) return { debitTotal: 0, creditTotal: 0, balanced: true };
    const d = sumAmount(props.lines!, "debit");
    const c = sumAmount(props.lines!, "credit");
    return { debitTotal: d, creditTotal: c, balanced: Math.abs(d - c) < PENNY_EPSILON };
  }, [props.lines, hasLines]);

  const canApprove = balanced && state === "idle";

  const respond = async (approved: boolean) => {
    setState("pending");
    setError(null);
    try {
      await authenticatedApiRequest("/chat/permission-reply", {
        method: "POST",
        body: JSON.stringify({
          request_id: props.request_id,
          approved,
        }),
      });
      setState(approved ? "approved" : "rejected");
    } catch (err) {
      setState("error");
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  if (state === "approved") {
    return (
      <div className="mt-2 mb-1 rounded-xl border border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-800 px-4 py-3 text-sm text-green-800 dark:text-green-300 flex items-center gap-2">
        <Check className="size-4 shrink-0" />
        Approved — submitting.
      </div>
    );
  }
  if (state === "rejected") {
    return (
      <div className="mt-2 mb-1 rounded-xl border border-muted bg-muted/40 px-4 py-3 text-sm text-muted-foreground flex items-center gap-2">
        <X className="size-4 shrink-0" />
        Rejected.
      </div>
    );
  }

  return (
    <div className="my-3 rounded-lg border border-border bg-background p-3 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground">{props.title}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            <code className="font-mono text-[10px]">{props.tool_name}</code>
            {props.voucher_series && (
              <>
                <span className="mx-1.5">·</span>
                series {props.voucher_series}
              </>
            )}
            {props.entry_date && (
              <>
                <span className="mx-1.5">·</span>
                {props.entry_date}
              </>
            )}
          </p>
          {props.description && (
            <p className="text-xs text-foreground/80 mt-1 text-pretty">{props.description}</p>
          )}
        </div>
        {!balanced && hasLines && (
          <span className="shrink-0 inline-flex items-center gap-1 rounded-full border border-destructive/40 bg-destructive/10 px-2 py-0.5 text-[10px] text-destructive">
            <AlertTriangle className="size-2.5" />
            Not balanced
          </span>
        )}
      </div>

      {hasLines && (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="px-2 py-1.5 text-left font-medium text-muted-foreground w-16">Account</th>
                <th className="px-2 py-1.5 text-left font-medium text-muted-foreground">Name</th>
                <th className="px-2 py-1.5 text-right font-medium text-muted-foreground w-24">Debit</th>
                <th className="px-2 py-1.5 text-right font-medium text-muted-foreground w-24">Credit</th>
                <th className="px-2 py-1.5 text-left font-medium text-muted-foreground w-20">VAT</th>
              </tr>
            </thead>
            <tbody>
              {props.lines!.map((line, i) => (
                <tr key={i} className="border-b border-border/40 last:border-0">
                  <td className="px-2 py-1.5 font-mono text-foreground">{line.account}</td>
                  <td className="px-2 py-1.5 text-foreground truncate max-w-[160px]">
                    {line.account_name ?? ""}
                  </td>
                  <td className="px-2 py-1.5 text-right tabular-nums text-blue-600 dark:text-blue-400">
                    {line.debit ? fmt(line.debit) : ""}
                  </td>
                  <td className="px-2 py-1.5 text-right tabular-nums text-foreground">
                    {line.credit ? fmt(line.credit) : ""}
                  </td>
                  <td
                    className={cn(
                      "px-2 py-1.5 text-[10px]",
                      line.vat_treatment ? "text-muted-foreground" : "text-muted-foreground/40",
                    )}
                  >
                    {line.vat_treatment ?? "—"}
                  </td>
                </tr>
              ))}
              <tr className="bg-muted/40 font-semibold">
                <td className="px-2 py-1.5" colSpan={2}>
                  Totals
                </td>
                <td className="px-2 py-1.5 text-right tabular-nums text-blue-600 dark:text-blue-400">
                  {fmt(debitTotal)}
                </td>
                <td className="px-2 py-1.5 text-right tabular-nums text-foreground">
                  {fmt(creditTotal)}
                </td>
                <td className="px-2 py-1.5" />
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {!hasLines && props.args && (
        <pre className="rounded-lg border border-border bg-muted/30 p-2 text-[11px] text-foreground overflow-x-auto">
          {JSON.stringify(props.args, null, 2)}
        </pre>
      )}

      {state === "error" && error && (
        <p className="text-xs text-destructive">{error}</p>
      )}

      <div className="flex items-center justify-end gap-2 pt-1">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => respond(false)}
          disabled={state === "pending"}
        >
          <X className="size-3.5 mr-1" />
          Reject
        </Button>
        <Button
          size="sm"
          onClick={() => respond(true)}
          disabled={!canApprove}
          className="bg-[#ee8fe0] hover:bg-[#ee8fe0]/90 text-[#171717]"
        >
          <Check className="size-3.5 mr-1" />
          {state === "pending" ? "Submitting…" : "Approve"}
        </Button>
      </div>
    </div>
  );
}
