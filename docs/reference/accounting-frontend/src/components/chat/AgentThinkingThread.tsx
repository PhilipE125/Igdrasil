import type { ToolCallBlock } from "@/lib/chat/types";

const PINK = "#ee8fe0";

function resolveStep(tool: ToolCallBlock): { label: string; detail?: string } {
  const name = tool.tool_name;
  const input = (tool.args ?? {}) as Record<string, unknown>;

  if (name === "skatteverket_search") {
    return {
      label: "Searching Skatteverket",
      detail: typeof input.query === "string" ? input.query : undefined,
    };
  }

  const labels: Record<string, string> = {
    list_latest_invoices:                   "Fetching invoices",
    get_invoice:                            "Getting invoice details",
    search_suppliers:                       "Searching suppliers",
    get_supplier:                           "Getting supplier",
    list_ledger_entries:                    "Fetching ledger entries",
    list_bank_transactions:                 "Fetching bank transactions",
    get_pipeline_status:                    "Checking pipeline status",
    run_pipeline:                           "Running pipeline",
    approve_invoice:                        "Approving invoice",
    post_journal_entry:                     "Posting journal entry",
    match_bank_transaction:                 "Matching bank transaction",
    trigger_fortnox_sync:                   "Triggering Fortnox sync",
    create_supplier:                        "Creating supplier",
    fortnox_list_invoices:                  "Fetching invoices",
    fortnox_get_invoice:                    "Getting invoice details",
    fortnox_list_supplier_invoices:         "Fetching supplier invoices",
    fortnox_get_supplier_invoice:           "Getting supplier invoice",
    fortnox_list_vouchers:                  "Fetching vouchers",
    fortnox_get_voucher:                    "Getting voucher",
    fortnox_list_accounts:                  "Fetching chart of accounts",
    fortnox_list_customers:                 "Fetching customers",
    fortnox_get_customer:                   "Getting customer",
    fortnox_list_suppliers:                 "Fetching suppliers",
    fortnox_get_supplier:                   "Getting supplier",
    fortnox_list_financial_years:           "Checking financial years",
    fortnox_list_voucher_series:            "Fetching voucher series",
    fortnox_profit_loss:                    "Fetching profit & loss report",
    fortnox_balance_sheet:                  "Fetching balance sheet",
    fortnox_list_articles:                  "Fetching articles",
    fortnox_list_projects:                  "Fetching projects",
    fortnox_list_cost_centres:              "Fetching cost centres",
    fortnox_list_employees:                 "Fetching employees",
    fortnox_list_currencies:                "Fetching currencies",
    fortnox_list_supplier_invoice_payments: "Fetching payments",
    fortnox_get:                            "Querying Fortnox",
  };

  return { label: labels[name] ?? name.replace(/_/g, " ") };
}

// SVG bead: thin 1.5px stem curves into a circle (r=4) via cubic beziers.
function buildBeadPath(topStem: boolean, bottomStem: boolean): string {
  const top = topStem
    ? "M 6.25 0 L 6.25 4 C 6.25 6, 3 7, 3 9"
    : "M 7 0 C 5 0, 3 3, 3 9";
  const bottom = bottomStem
    ? "C 3 11, 6.25 12, 6.25 14 L 6.25 18 L 7.75 18 L 7.75 14 C 7.75 12, 11 11, 11 9"
    : "C 3 11, 5 14, 7 14 C 9 14, 11 11, 11 9";
  const topRight = topStem
    ? "C 11 7, 7.75 6, 7.75 4 L 7.75 0 Z"
    : "C 11 3, 9 0, 7 0 Z";
  return `${top} ${bottom} ${topRight}`;
}

const BEAD = {
  mid:   buildBeadPath(true, true),
  first: buildBeadPath(false, true),
  last:  buildBeadPath(true, false),
  solo:  buildBeadPath(false, false),
} as const;

function StepRow({
  label,
  detail,
  done,
  showLine,
  isFirst,
  isLast,
}: {
  label: string;
  detail?: string;
  done: boolean;
  showLine: boolean;
  isFirst: boolean;
  isLast: boolean;
}) {
  const beadColor = done ? PINK : `${PINK}60`;
  const lineColor = done ? PINK : "hsl(var(--border) / 0.4)";
  const beadD = isFirst && isLast && !showLine ? BEAD.solo
    : isFirst ? BEAD.first
    : isLast && !showLine ? BEAD.last
    : BEAD.mid;

  return (
    <div className="flex items-stretch gap-2 animate-[step-in_200ms_ease-out_both]">
      <div className="flex flex-col items-center w-[14px] shrink-0">
        <svg width="14" height="18" viewBox="0 0 14 18" className="block shrink-0">
          <path d={beadD} fill={beadColor} style={{ transition: "fill 350ms ease" }} />
          {done && (
            <circle cx="7" cy="9" r="5" fill="none" stroke={PINK} strokeWidth="0.5" opacity="0.3" />
          )}
          {!done && (
            <>
              <circle cx="7" cy="9" r="6" fill="none" stroke={`${PINK}20`} strokeWidth="0.8" />
              <circle
                cx="7" cy="9" r="6" fill="none"
                stroke={PINK} strokeWidth="0.8"
                strokeDasharray="12 26"
                strokeLinecap="round"
                style={{ transformOrigin: "7px 9px", animation: "agent-spin 0.8s linear infinite" }}
              />
            </>
          )}
        </svg>
        {showLine && (
          <div
            className="w-[1.5px] flex-1 min-h-[4px]"
            style={{ backgroundColor: lineColor, transition: "background-color 350ms ease" }}
          />
        )}
      </div>

      <div className={`min-w-0 pt-[3px] ${showLine ? "pb-0.5" : "pb-0"}`}>
        <p className={`text-xs leading-[18px] transition-colors duration-300 ${done ? "text-muted-foreground" : "text-foreground font-medium"}`}>
          {label}
        </p>
        {detail && (
          <p className="text-[11px] leading-tight text-muted-foreground/50 truncate max-w-[240px]">
            {detail}
          </p>
        )}
      </div>
    </div>
  );
}

interface Props {
  /** Tool-call blocks to render as the step ladder. */
  toolCalls: ToolCallBlock[];
  /** Most recent chain-of-thought text, tail-truncated. */
  latestThought?: string;
  isStreaming?: boolean;
  /** Hide the "Thinking"/"Working" label when embedded in the collapsed summary. */
  hideLabelWhenEmpty?: boolean;
}

/**
 * Render the step ladder + live "Working" indicator. Input comes from props
 * (caller passes the tool_call blocks from a single assistant message, or the
 * aggregated set while streaming).
 */
export function AgentThinkingThread({
  toolCalls,
  latestThought,
  isStreaming,
  hideLabelWhenEmpty,
}: Props) {
  const allToolsDone = toolCalls.length > 0 && toolCalls.every((t) => t.hasCompleted);
  const stillGenerating = allToolsDone && isStreaming;

  if (toolCalls.length === 0) {
    if (hideLabelWhenEmpty) return null;
    return (
      <div className="flex flex-col gap-1 py-0.5 px-0.5">
        <div className="flex items-center gap-2">
          <span className="size-3 rounded-full border-[1.5px] border-muted-foreground/30 border-t-foreground/70 animate-spin shrink-0" />
          <span className="text-xs text-muted-foreground">Thinking</span>
        </div>
        {isStreaming && latestThought && (
          <p className="text-[11px] leading-snug text-muted-foreground/60 italic pl-5 max-w-prose whitespace-pre-wrap">
            {latestThought}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="py-0.5">
      {toolCalls.map((tool, i) => {
        const { label, detail } = resolveStep(tool);
        const isLast = i === toolCalls.length - 1;
        return (
          <StepRow
            key={i}
            label={label}
            detail={detail}
            done={!!tool.hasCompleted}
            showLine={i < toolCalls.length - 1 || !allToolsDone || !!stillGenerating}
            isFirst={i === 0}
            isLast={isLast && !stillGenerating}
          />
        );
      })}

      {stillGenerating && (
        <StepRow
          label="Generating response"
          done={false}
          showLine={false}
          isFirst={false}
          isLast={true}
        />
      )}

      {!allToolsDone && (
        <div className="flex flex-col gap-1 pl-[5px]">
          <div className="flex items-center gap-2">
            <div className="size-[5px] rounded-full animate-pulse" style={{ backgroundColor: `${PINK}50` }} />
            <span className="text-[11px] text-muted-foreground/50">Working</span>
          </div>
          {isStreaming && latestThought && (
            <p className="text-[11px] leading-snug text-muted-foreground/60 italic max-w-prose whitespace-pre-wrap">
              {latestThought}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

