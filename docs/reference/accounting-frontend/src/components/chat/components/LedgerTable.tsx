import { cn } from "@/lib/utils";

export interface LedgerRow {
  id: string;
  date: string;
  description: string;
  debit?: number;
  credit?: number;
  balance?: number;
}

export interface LedgerTableProps {
  title?: string;
  accountNumber?: string;
  entries: LedgerRow[];
  openingBalance?: number;
  currency?: string;
}

function fmtAmt(v?: number): string {
  if (v === undefined || v === 0) return "";
  return v.toLocaleString("sv-SE");
}

export function LedgerTable({
  title,
  accountNumber,
  entries,
  openingBalance,
  currency = "SEK",
}: LedgerTableProps) {
  const heading = title ?? (accountNumber ? `Account ${accountNumber}` : "Ledger");

  return (
    <div className="my-3 border-y border-border/40 py-3">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium text-foreground">{heading}</p>
        <span className="text-xs text-muted-foreground">{currency}</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border">
              <th className="pb-1.5 text-left font-medium text-muted-foreground pr-3 w-20">Date</th>
              <th className="pb-1.5 text-left font-medium text-muted-foreground pr-3">Description</th>
              <th className="pb-1.5 text-right font-medium text-muted-foreground pr-3 w-24">Debit</th>
              <th className="pb-1.5 text-right font-medium text-muted-foreground pr-3 w-24">Credit</th>
              <th className="pb-1.5 text-right font-medium text-muted-foreground w-28">Balance</th>
            </tr>
          </thead>
          <tbody>
            {openingBalance !== undefined && (
              <tr className="border-b border-border/50">
                <td className="py-1.5 pr-3 text-muted-foreground">—</td>
                <td className="py-1.5 pr-3 text-muted-foreground italic">Opening balance</td>
                <td className="py-1.5 pr-3 text-right tabular-nums" />
                <td className="py-1.5 pr-3 text-right tabular-nums" />
                <td
                  className={cn(
                    "py-1.5 text-right tabular-nums font-medium",
                    openingBalance >= 0 ? "text-foreground" : "text-red-600 dark:text-red-400",
                  )}
                >
                  {fmtAmt(openingBalance)}
                </td>
              </tr>
            )}
            {entries.map((e) => (
              <tr
                key={e.id}
                className="border-b border-border/40 last:border-0 hover:bg-muted/30 transition-colors"
              >
                <td className="py-1.5 pr-3 text-muted-foreground whitespace-nowrap">{e.date}</td>
                <td className="py-1.5 pr-3 text-foreground truncate max-w-[180px]">{e.description}</td>
                <td className="py-1.5 pr-3 text-right tabular-nums text-blue-600 dark:text-blue-400">
                  {fmtAmt(e.debit)}
                </td>
                <td className="py-1.5 pr-3 text-right tabular-nums text-foreground">
                  {fmtAmt(e.credit)}
                </td>
                <td
                  className={cn(
                    "py-1.5 text-right tabular-nums font-medium",
                    (e.balance ?? 0) >= 0 ? "text-foreground" : "text-red-600 dark:text-red-400",
                  )}
                >
                  {e.balance !== undefined ? fmtAmt(e.balance) : ""}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
