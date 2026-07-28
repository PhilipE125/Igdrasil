"use client";

import Link from "next/link";
import { useState } from "react";
import { siteCopy } from "@/lib/content";
import { cn } from "@/lib/utils";

const FLAT_FEE_SEK = 250;
const TOKENS_PER_INVOICE = 10_000;
const INPUT_PRICE_PER_M_USD = 0.25;
const OUTPUT_PRICE_PER_M_USD = 1.5;
const MARKUP = 1.1;
const USD_TO_SEK = 10.5;

const RAW_TOKEN_SEK_PER_INVOICE =
  ((TOKENS_PER_INVOICE / 2 / 1_000_000) * INPUT_PRICE_PER_M_USD +
    (TOKENS_PER_INVOICE / 2 / 1_000_000) * OUTPUT_PRICE_PER_M_USD) *
  USD_TO_SEK;

export function Pricing() {
  const { pricing } = siteCopy;
  const [invoiceCount, setInvoiceCount] = useState(100);

  const tokensSek = invoiceCount * RAW_TOKEN_SEK_PER_INVOICE;
  const markupSek = tokensSek * (MARKUP - 1);
  const monthlyTotalSek = FLAT_FEE_SEK + tokensSek + markupSek;

  return (
    <section
      id="pricing"
      className="bg-background @container flex items-center py-16 md:py-20 scroll-mt-24"
    >
      <div className="mx-auto w-full max-w-6xl px-6 lg:px-12">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Copy column */}
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground font-semibold">
              {pricing.eyebrow}
            </p>
            <h2 className="mt-3 font-display text-4xl md:text-5xl lg:text-6xl font-black tracking-[0.02em] text-foreground text-balance">
              {pricing.heading}
            </h2>
            <p className="mt-5 text-base md:text-lg text-muted-foreground text-pretty max-w-xl">
              {pricing.sub}
            </p>

            <div className="mt-8 flex flex-wrap items-baseline gap-x-8 gap-y-3">
              <p className="leading-none">
                <span className="text-5xl font-black text-foreground tabular-nums">
                  250 SEK
                </span>
                <span className="ml-2 text-sm text-muted-foreground">
                  {pricing.flatFeeLabel}
                </span>
              </p>
              <p className="leading-none">
                <span className="text-5xl font-black text-foreground tabular-nums">
                  +10%
                </span>
                <span className="ml-2 text-sm text-muted-foreground whitespace-nowrap">
                  {pricing.markupLabel}
                </span>
              </p>
            </div>

            <p className="mt-6 text-sm text-muted-foreground">{pricing.note}</p>

            <div className="mt-8">
              <Link
                href={pricing.cta.href}
                className="inline-flex h-11 items-center justify-center rounded-[10px] bg-foreground px-6 text-base font-semibold text-background shadow-[inset_0_-2px_0_0_rgba(0,0,0,0.2)] hover:bg-foreground/85 hover:shadow-none transition-all"
              >
                {pricing.cta.label}
              </Link>
            </div>
          </div>

          {/* Simulation card */}
          <div className="border border-border bg-card rounded-2xl p-6 md:p-8 shadow-md shadow-black/[0.04]">
            <div className="flex items-baseline justify-between">
              <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground font-semibold">
                {pricing.simLabel}
              </p>
              <span className="inline-flex items-center rounded-full bg-foreground/[0.06] px-2.5 py-1 text-xs font-medium text-foreground/85">
                No add-on fees
              </span>
            </div>

            <div className="mt-5 flex items-baseline justify-between gap-2">
              <span className="text-3xl font-bold text-foreground tabular-nums">
                {invoiceCount}
              </span>
              <span className="text-xs text-muted-foreground">
                {pricing.invoicesLabel}
              </span>
            </div>

            <input
              type="range"
              min={10}
              max={1000}
              step={10}
              value={invoiceCount}
              onChange={(e) => setInvoiceCount(Number(e.target.value))}
              aria-label="Monthly invoices and receipts"
              className={cn(
                "mt-3 w-full h-1.5 cursor-pointer appearance-none rounded-full bg-foreground/10 outline-none",
                "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:size-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-foreground [&::-webkit-slider-thumb]:cursor-grab [&::-webkit-slider-thumb]:active:cursor-grabbing [&::-webkit-slider-thumb]:shadow-[0_1px_2px_rgba(0,0,0,0.25)]",
                "[&::-moz-range-thumb]:size-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-foreground [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-grab",
              )}
            />
            <div className="mt-1.5 flex justify-between text-[11px] text-muted-foreground/70 tabular-nums">
              <span>10</span>
              <span>1,000</span>
            </div>

            <dl className="mt-6 space-y-2 text-sm">
              <Row label={pricing.breakdown.flat} value={FLAT_FEE_SEK} />
              <Row label={pricing.breakdown.tokens} value={tokensSek} />
              <Row label={pricing.breakdown.markup} value={markupSek} />
            </dl>

            <div className="mt-5 pt-4 border-t border-border flex items-baseline justify-between">
              <span className="text-base font-semibold text-foreground">
                {pricing.breakdown.total}
              </span>
              <span className="leading-none">
                <span className="text-muted-foreground text-sm">≈</span>
                <span className="ml-1.5 text-3xl font-black text-foreground tabular-nums">
                  {monthlyTotalSek.toFixed(1)}
                </span>
                <span className="ml-1.5 text-xs text-muted-foreground">
                  SEK / mo
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Row({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between text-muted-foreground">
      <dt>{label}</dt>
      <dd className="tabular-nums">{value.toFixed(1)} SEK</dd>
    </div>
  );
}
