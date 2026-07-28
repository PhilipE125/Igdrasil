/**
 * InvoicePreview — live HTML invoice preview.
 *
 * Faithfully ported from Midday's packages/invoice/src/templates/html/.
 * Accepts the form state from CustomerInvoiceEditorSheet and renders an
 * A4-style invoice that updates in real-time as the user types.
 */

import { format, parseISO } from "date-fns";
import type { ReactNode } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";

// ─── Types ────────────────────────────────────────────────────────────────────

export type PreviewLineItem = {
  name: string;
  quantity: number;
  price: number;
  unit?: string;
  taxRate?: number; // percentage, e.g. 25
};

type InlineMark = {
  type: "bold" | "italic" | "link" | "strike";
  attrs?: { href?: string };
};

type InlineContent = {
  type: "text" | "hardBreak";
  text?: string;
  marks?: InlineMark[];
};

type EditorNode = {
  type: "paragraph";
  content?: InlineContent[];
};

export type EditorDoc = {
  type: "doc";
  content: EditorNode[];
};

// ─── EditorDoc helpers ────────────────────────────────────────────────────────

/** Convert a plain multi-line string into an EditorDoc. */
export function textToEditorDoc(text: string): EditorDoc {
  const lines = text.split("\n");
  return {
    type: "doc",
    content: lines.map((line) => ({
      type: "paragraph" as const,
      content: line ? [{ type: "text" as const, text: line }] : [],
    })),
  };
}

/** Render an EditorDoc to React nodes. */
function formatEditorContent(doc?: EditorDoc | null): ReactNode | null {
  if (!doc?.content?.length) return null;

  return (
    <>
      {doc.content.map((node, ni) => {
        if (node.type !== "paragraph") return null;
        return (
          <p key={ni}>
            {node.content?.map((inline, ii) => {
              if (inline.type === "hardBreak") return <br key={ii} />;
              if (inline.type !== "text") return null;

              let cls = "text-[11px]";
              let href: string | undefined;

              for (const mark of inline.marks ?? []) {
                if (mark.type === "bold") cls += " font-semibold";
                else if (mark.type === "italic") cls += " italic";
                else if (mark.type === "strike") cls += " line-through";
                else if (mark.type === "link") {
                  href = mark.attrs?.href;
                  cls += " underline";
                }
              }

              const text = inline.text ?? "";
              const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text);

              if (href || isEmail) {
                return (
                  <a key={ii} href={href ?? `mailto:${text}`} className={`${cls} underline`}>
                    {text}
                  </a>
                );
              }

              return <span key={ii} className={cls}>{text}</span>;
            })}
          </p>
        );
      })}
    </>
  );
}

// ─── Calculation helpers (from Midday's utils/calculate.ts) ──────────────────

function calcTotal(
  lineItems: PreviewLineItem[],
  opts: {
    includeVat?: boolean;
    vatRate?: number;
    includeTax?: boolean;
    taxRate?: number;
    includeLineItemTax?: boolean;
    discount?: number;
  } = {},
) {
  const {
    includeVat = false,
    vatRate = 0,
    includeTax = false,
    taxRate = 0,
    includeLineItemTax = false,
    discount = 0,
  } = opts;

  const subTotal = lineItems.reduce((acc, item) => acc + (item.price ?? 0) * (item.quantity ?? 0), 0);
  const vat = includeVat ? (subTotal * vatRate) / 100 : 0;

  let tax = 0;
  if (includeLineItemTax) {
    tax = lineItems.reduce((acc, item) => {
      const lineTotal = (item.price ?? 0) * (item.quantity ?? 0);
      return acc + (lineTotal * (item.taxRate ?? 0)) / 100;
    }, 0);
  } else if (includeTax) {
    tax = (subTotal * taxRate) / 100;
  }

  const total = subTotal + vat + tax - (discount ?? 0);
  return { subTotal, total, vat, tax };
}

function lineItemTotal(price = 0, quantity = 0) {
  return (price ?? 0) * (quantity ?? 0);
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function EditorContent({ content }: { content?: EditorDoc | null }) {
  const rendered = formatEditorContent(content);
  if (!rendered) return null;
  return <div className="leading-4">{rendered}</div>;
}

function Meta({
  title,
  invoiceNumber,
  issueDate,
  dueDate,
  invoiceNoLabel = "Invoice No",
  issueDateLabel = "Issue Date",
  dueDateLabel = "Due Date",
  dateFormat = "yyyy-MM-dd",
}: {
  title: string;
  invoiceNumber?: string | null;
  issueDate?: string | null;
  dueDate?: string | null;
  invoiceNoLabel?: string;
  issueDateLabel?: string;
  dueDateLabel?: string;
  dateFormat?: string;
}) {
  function fmt(d: string | null | undefined) {
    if (!d) return "";
    try { return format(parseISO(d), dateFormat); } catch { return d; }
  }

  return (
    <div className="mb-2">
      <h2
        className="text-[21px] font-serif mb-1 min-w-[100px] w-full max-w-full"
        style={{
          overflow: "hidden",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          wordBreak: "normal",
          overflowWrap: "break-word",
          hyphens: "auto",
        }}
      >
        {title}
      </h2>
      <div className="flex flex-col gap-0.5">
        {[
          { label: invoiceNoLabel, value: invoiceNumber },
          { label: issueDateLabel, value: fmt(issueDate) },
          { label: dueDateLabel, value: fmt(dueDate) },
        ].map(({ label, value }) =>
          value ? (
            <div key={label} className="flex space-x-1 items-center">
              <span className="truncate text-[11px] text-[#878787]">{label}:</span>
              <span className="text-[11px] flex-shrink-0">{value}</span>
            </div>
          ) : null,
        )}
      </div>
    </div>
  );
}

function LineItems({
  lineItems,
  currency,
  locale,
  descriptionLabel = "Description",
  quantityLabel = "Qty",
  priceLabel = "Price",
  totalLabel = "Total",
  taxLabel = "VAT",
  includeDecimals = true,
  includeUnits = false,
  includeLineItemTax = true,
}: {
  lineItems: PreviewLineItem[];
  currency: string;
  locale: string;
  descriptionLabel?: string;
  quantityLabel?: string;
  priceLabel?: string;
  totalLabel?: string;
  taxLabel?: string;
  includeDecimals?: boolean;
  includeUnits?: boolean;
  includeLineItemTax?: boolean;
}) {
  const maxFrac = includeDecimals ? 2 : 0;
  const fmt = (amount: number) =>
    new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      maximumFractionDigits: maxFrac,
    }).format(amount);

  const gridCols = includeLineItemTax
    ? "grid-cols-[1.5fr_12%_12%_12%_15%]"
    : "grid-cols-[1.5fr_15%_15%_15%]";

  return (
    <div className="mt-5 font-mono">
      {/* Header row */}
      <div className={`grid ${gridCols} gap-4 items-end mb-2 w-full pb-1 border-b border-border`}>
        <div className="text-[11px] text-[#878787]">{descriptionLabel}</div>
        <div className="text-[11px] text-[#878787]">{quantityLabel}</div>
        <div className="text-[11px] text-[#878787]">{priceLabel}</div>
        {includeLineItemTax && (
          <div className="text-[11px] text-[#878787]">{taxLabel}</div>
        )}
        <div className="text-[11px] text-[#878787] text-right">{totalLabel}</div>
      </div>

      {/* Line item rows */}
      {lineItems.map((item, i) => (
        <div key={i} className={`grid ${gridCols} gap-4 items-start mb-1 w-full py-1`}>
          <div className="self-start">
            <span className="text-[11px] leading-4">{item.name || <span className="text-[#878787]">—</span>}</span>
          </div>
          <div className="text-[11px] self-start">{item.quantity ?? 0}</div>
          <div className="text-[11px] self-start">
            {includeUnits && item.unit
              ? `${fmt(item.price ?? 0)}/${item.unit}`
              : fmt(item.price ?? 0)}
          </div>
          {includeLineItemTax && (
            <div className="text-[11px] self-start">
              {item.taxRate != null ? `${item.taxRate}%` : "0%"}
            </div>
          )}
          <div className="text-[11px] text-right self-start">
            {fmt(lineItemTotal(item.price, item.quantity))}
          </div>
        </div>
      ))}

      {lineItems.length === 0 && (
        <div className="text-[11px] text-[#878787] py-2">No line items yet</div>
      )}
    </div>
  );
}

function Summary({
  lineItems,
  currency,
  locale,
  includeLineItemTax = true,
  includeVat = false,
  vatRate = 0,
  includeTax = false,
  taxRate = 0,
  includeDiscount = false,
  discount = 0,
  includeDecimals = true,
  subtotalLabel = "Subtotal",
  vatLabel = "VAT",
  taxLabel = "Tax",
  discountLabel = "Discount",
  totalLabel = "Total",
}: {
  lineItems: PreviewLineItem[];
  currency: string;
  locale: string;
  includeLineItemTax?: boolean;
  includeVat?: boolean;
  vatRate?: number;
  includeTax?: boolean;
  taxRate?: number;
  includeDiscount?: boolean;
  discount?: number;
  includeDecimals?: boolean;
  subtotalLabel?: string;
  vatLabel?: string;
  taxLabel?: string;
  discountLabel?: string;
  totalLabel?: string;
}) {
  const maxFrac = includeDecimals ? 2 : 0;
  const fmt = (amount: number, fractionDigits = maxFrac) =>
    new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      maximumFractionDigits: fractionDigits,
    }).format(amount);

  const { subTotal, total, vat, tax } = calcTotal(lineItems, {
    includeVat,
    vatRate,
    includeTax,
    taxRate,
    includeLineItemTax,
    discount,
  });

  return (
    <div className="w-[280px] flex flex-col">
      <div className="flex justify-between items-center py-1">
        <span className="text-[11px] text-[#878787] font-mono">{subtotalLabel}</span>
        <span className="text-right text-[11px] text-[#878787]">{fmt(subTotal)}</span>
      </div>

      {includeDiscount && discount > 0 && (
        <div className="flex justify-between items-center py-1">
          <span className="text-[11px] text-[#878787] font-mono">{discountLabel}</span>
          <span className="text-right text-[11px] text-[#878787]">−{fmt(discount)}</span>
        </div>
      )}

      {includeVat && (
        <div className="flex justify-between items-center py-1">
          <span className="text-[11px] text-[#878787] font-mono">{vatLabel} ({vatRate}%)</span>
          <span className="text-right text-[11px] text-[#878787]">{fmt(vat, 2)}</span>
        </div>
      )}

      {includeLineItemTax && tax > 0 && (
        <div className="flex justify-between items-center py-1">
          <span className="text-[11px] text-[#878787] font-mono">{vatLabel}</span>
          <span className="text-right text-[11px] text-[#878787]">{fmt(tax, 2)}</span>
        </div>
      )}

      {includeTax && !includeLineItemTax && (
        <div className="flex justify-between items-center py-1">
          <span className="text-[11px] text-[#878787] font-mono">{taxLabel} ({taxRate}%)</span>
          <span className="text-right text-[11px] text-[#878787]">{fmt(tax, 2)}</span>
        </div>
      )}

      <div className="flex justify-between items-center py-4 mt-2 border-t border-border">
        <span className="text-[11px] text-[#878787] font-mono">{totalLabel}</span>
        <span className="text-right text-[21px]">{fmt(total, 2)}</span>
      </div>
    </div>
  );
}

// ─── Main InvoicePreview component ───────────────────────────────────────────

export type InvoicePreviewData = {
  invoiceNumber?: string | null;
  issueDate?: string | null;
  dueDate?: string | null;
  currency: string;
  locale?: string;
  lineItems: PreviewLineItem[];
  fromDetails?: EditorDoc | null;
  customerDetails?: EditorDoc | null;
  paymentDetails?: EditorDoc | null;
  noteDetails?: EditorDoc | null;
  /** Show VAT per line item */
  includeLineItemTax?: boolean;
  /** Invoice-level VAT toggle */
  includeVat?: boolean;
  vatRate?: number;
  includeDiscount?: boolean;
  discount?: number;
  includeUnits?: boolean;
  includeDecimals?: boolean;
};

const LABELS = {
  title: "Invoice",
  invoiceNoLabel: "Invoice No",
  issueDateLabel: "Issue Date",
  dueDateLabel: "Due Date",
  fromLabel: "From",
  customerLabel: "To",
  descriptionLabel: "Description",
  quantityLabel: "Qty",
  priceLabel: "Price",
  totalLabel: "Total",
  subtotalLabel: "Subtotal",
  vatLabel: "VAT",
  taxLabel: "Tax",
  discountLabel: "Discount",
  totalSummaryLabel: "Total",
  paymentLabel: "Payment Details",
  noteLabel: "Note",
};

export function InvoicePreview({ data }: { data: InvoicePreviewData }) {
  const locale = data.locale ?? "sv-SE";
  const includeLineItemTax = data.includeLineItemTax ?? true;
  const includeVat = data.includeVat ?? false;
  const vatRate = data.vatRate ?? 0;
  const includeDiscount = data.includeDiscount ?? false;
  const discount = data.discount ?? 0;
  const includeUnits = data.includeUnits ?? false;
  const includeDecimals = data.includeDecimals ?? true;

  return (
    <ScrollArea className="h-full w-full bg-background">
      <div
        className="p-6 md:p-8 min-h-full flex flex-col"
        style={{ background: "#fcfcfc" }}
      >
        {/* ── Meta ── */}
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0 mr-5">
            <Meta
              title={LABELS.title}
              invoiceNumber={data.invoiceNumber}
              issueDate={data.issueDate}
              dueDate={data.dueDate}
              invoiceNoLabel={LABELS.invoiceNoLabel}
              issueDateLabel={LABELS.issueDateLabel}
              dueDateLabel={LABELS.dueDateLabel}
              dateFormat="yyyy-MM-dd"
            />
          </div>
        </div>

        {/* ── From / To ── */}
        <div className="grid grid-cols-2 gap-4 md:gap-6 mt-6 mb-4">
          <div>
            <p className="text-[11px] text-[#878787] mb-2">{LABELS.fromLabel}</p>
            <EditorContent content={data.fromDetails} />
          </div>
          <div>
            <p className="text-[11px] text-[#878787] mb-2">{LABELS.customerLabel}</p>
            <EditorContent content={data.customerDetails} />
          </div>
        </div>

        {/* ── Line items ── */}
        <LineItems
          lineItems={data.lineItems}
          currency={data.currency}
          locale={locale}
          descriptionLabel={LABELS.descriptionLabel}
          quantityLabel={LABELS.quantityLabel}
          priceLabel={LABELS.priceLabel}
          totalLabel={LABELS.totalLabel}
          taxLabel={LABELS.vatLabel}
          includeLineItemTax={includeLineItemTax}
          includeUnits={includeUnits}
          includeDecimals={includeDecimals}
        />

        {/* ── Summary ── */}
        <div className="mt-10 md:mt-12 flex justify-end mb-6 md:mb-8">
          <Summary
            lineItems={data.lineItems}
            currency={data.currency}
            locale={locale}
            includeLineItemTax={includeLineItemTax}
            includeVat={includeVat}
            vatRate={vatRate}
            includeDiscount={includeDiscount}
            discount={discount}
            includeDecimals={includeDecimals}
            subtotalLabel={LABELS.subtotalLabel}
            vatLabel={LABELS.vatLabel}
            totalLabel={LABELS.totalSummaryLabel}
          />
        </div>

        {/* ── Payment / Notes ── */}
        {(data.paymentDetails || data.noteDetails) && (
          <div className="grid grid-cols-2 gap-4 md:gap-6 mt-auto">
            {data.paymentDetails && (
              <div>
                <p className="text-[11px] text-[#878787] mb-2">{LABELS.paymentLabel}</p>
                <EditorContent content={data.paymentDetails} />
              </div>
            )}
            {data.noteDetails && (
              <div>
                <p className="text-[11px] text-[#878787] mb-2">{LABELS.noteLabel}</p>
                <EditorContent content={data.noteDetails} />
              </div>
            )}
          </div>
        )}
      </div>
    </ScrollArea>
  );
}
