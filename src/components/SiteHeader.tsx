"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronDownIcon } from "@/components/icons";
import { ThemeToggle } from "@/components/ThemeToggle";
import { navDropdowns, navLinks, siteCopy } from "@/lib/content";
import { cn } from "@/lib/utils";

// Cost simulation constants
const FLAT_FEE_SEK = 25;
const TOKENS_PER_INVOICE = 10_000;
const INPUT_PRICE_PER_M_USD = 0.25;
const OUTPUT_PRICE_PER_M_USD = 1.5;
const MARKUP = 1.1;
const USD_TO_SEK = 10.5;

// 50/50 split between input and output tokens, raw cost (no markup)
const RAW_TOKEN_SEK_PER_INVOICE =
  ((TOKENS_PER_INVOICE / 2 / 1_000_000) * INPUT_PRICE_PER_M_USD +
    (TOKENS_PER_INVOICE / 2 / 1_000_000) * OUTPUT_PRICE_PER_M_USD) *
  USD_TO_SEK;

export function SiteHeader() {
  const [openId, setOpenId] = useState<string | null>(null);
  const [invoiceCount, setInvoiceCount] = useState(100);
  const headerRef = useRef<HTMLDivElement>(null);

  const tokensSek = invoiceCount * RAW_TOKEN_SEK_PER_INVOICE;
  const markupSek = tokensSek * (MARKUP - 1);
  const monthlyTotalSek = FLAT_FEE_SEK + tokensSek + markupSek;

  const focusWaitlist = (e: React.MouseEvent) => {
    if (siteCopy.authBar.signUp.href !== "#waitlist") return;
    e.preventDefault();
    setOpenId(null);
    const target = document.getElementById("waitlist");
    const input = document.getElementById("waitlist-email") as HTMLInputElement | null;
    target?.scrollIntoView({ behavior: "smooth", block: "center" });
    setTimeout(() => input?.focus({ preventScroll: true }), 600);
  };

  // Click-outside closes the dropdown
  useEffect(() => {
    if (!openId) return;
    const onClick = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setOpenId(null);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenId(null);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [openId]);

  return (
    <>
      <Link
        aria-label="home"
        href="/"
        className="fixed top-3 left-3 md:top-6 md:left-8 z-50 flex items-center gap-2 md:gap-3 text-foreground hover:opacity-80 transition-opacity"
      >
        <Image src="/logo.svg" alt="" width={56} height={56} className="size-9 md:size-14" />
        <span className="hidden md:inline font-display text-3xl md:text-4xl font-semibold tracking-wider">Igdrasil</span>
      </Link>

      <div className="fixed top-3 right-3 md:top-6 md:right-8 z-50">
        <ThemeToggle />
      </div>

    <div ref={headerRef} className="fixed inset-x-0 top-3 z-50 flex justify-center px-4 pointer-events-none">
      <header
        role="banner"
        data-state={openId ? "active" : "inactive"}
        className={cn(
          "pointer-events-auto relative bg-popover/50 ring-1 ring-border shadow-md shadow-black/[0.065] rounded-xl backdrop-blur-xl",
          "transition-[max-width,padding] duration-300 ease-out",
          openId
            ? "max-w-[calc(100vw-7rem)] md:max-w-[640px] py-1.5 px-1.5"
            : "max-w-[calc(100vw-7rem)] md:max-w-xl py-1.5 pl-1.5 pr-1.5",
        )}
      >
        <div className="flex items-center gap-0.5 lg:gap-1">
          <nav aria-label="Main" className="flex items-center gap-0.5">
            {navDropdowns.map((d) => {
              const isOpen = openId === d.label;
              return (
                <div key={d.label} className="relative">
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    data-state={isOpen ? "open" : "closed"}
                    onClick={() =>
                      setOpenId((cur) => (cur === d.label ? null : d.label))
                    }
                    className={cn(
                      "group inline-flex h-7 lg:h-8 items-center gap-1 lg:gap-1.5 rounded-md px-2 lg:px-3 text-[12px] lg:text-sm font-medium transition-colors",
                      isOpen
                        ? "bg-foreground/5 text-foreground"
                        : "text-foreground/75 hover:bg-foreground/5 hover:text-foreground",
                    )}
                  >
                    {d.label}
                    <ChevronDownIcon
                      className={cn(
                        "size-3 opacity-75 transition-transform duration-200",
                        isOpen && "rotate-180",
                      )}
                    />
                  </button>
                </div>
              );
            })}
            {navLinks.map((l) => (
              <Link
                key={l.label}
                href={l.href}
                className="hidden md:inline-flex h-8 items-center rounded-md px-3 text-sm font-medium text-foreground/75 hover:bg-foreground/5 hover:text-foreground transition-colors"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-1">
            <Link
              href={siteCopy.authBar.signUp.href}
              onClick={focusWaitlist}
              className="inline-flex h-7 lg:h-8 items-center rounded-md bg-foreground px-2 lg:px-3 text-[11px] lg:text-xs font-semibold text-background shadow-[inset_0_-2px_0_0_rgba(0,0,0,0.2)] hover:bg-foreground/85 hover:shadow-none transition-all"
            >
              {siteCopy.authBar.signUp.label}
            </Link>
          </div>
        </div>

        {/* Dropdown viewport */}
        <div
          className={cn(
            "grid absolute left-1/2 top-[calc(100%+8px)] -translate-x-1/2",
            "w-[calc(100vw-1.5rem)]",
            openId === "Product" || openId === "Services"
              ? "lg:w-[680px]"
              : "lg:w-[600px]",
            "transition-all duration-200 ease-out origin-top",
            openId
              ? "opacity-100 translate-y-0 scale-100 pointer-events-auto"
              : "opacity-0 -translate-y-1 scale-[0.98] pointer-events-none",
          )}
        >
          <div className="rounded-xl bg-popover ring-1 ring-border shadow-lg shadow-black/[0.15] p-2">
            {navDropdowns.map((d) => {
              if (openId !== d.label) return null;
              const hasSideCard = d.label === "Product" || d.label === "Services";
              const itemList = (
                <ul
                  className={cn(
                    "gap-0.5",
                    hasSideCard ? "grid grid-cols-1" : "grid grid-cols-2",
                  )}
                >
                  {d.items.map((item) => (
                    <li key={item.label}>
                      <Link
                        href={item.href}
                        onClick={() => setOpenId(null)}
                        className="flex items-start gap-3 rounded-md p-3 hover:bg-foreground/5 transition-colors"
                      >
                        {item.Icon && (
                          <span className="grid size-8 shrink-0 place-items-center rounded-md bg-foreground/5 text-foreground">
                            <item.Icon className="size-4" />
                          </span>
                        )}
                        <span className="min-w-0">
                          <span className="block text-sm font-semibold text-foreground">
                            {item.label}
                          </span>
                          {item.description && (
                            <span className="mt-0.5 block text-xs text-muted-foreground line-clamp-2">
                              {item.description}
                            </span>
                          )}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              );

              if (d.label === "Product") {
                return (
                  <div key={d.label} className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-2">
                    {itemList}
                    <div className="border-t lg:border-t-0 lg:border-l border-border pt-3 lg:pt-3 lg:pl-4 lg:pr-3 lg:py-3 px-3 pb-3 text-left">
                      <p className="leading-tight">
                        <span className="text-3xl font-bold text-foreground">25 SEK</span>
                        <span className="ml-1.5 text-xs text-muted-foreground">/ month</span>
                      </p>
                      <p className="mt-1.5 leading-tight">
                        <span className="text-3xl font-bold text-foreground">+10%</span>
                        <span className="ml-1.5 text-xs text-muted-foreground whitespace-nowrap">markup on token consumption</span>
                      </p>

                      <div className="mt-4 pt-3 border-t border-border">
                        <p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground font-semibold">
                          Cost simulation
                        </p>
                        <div className="mt-2 flex items-baseline justify-between gap-2">
                          <span className="text-sm font-semibold text-foreground tabular-nums">
                            {invoiceCount}
                          </span>
                          <span className="text-[11px] text-muted-foreground">
                            invoices / month
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
                            "mt-2 w-full h-1 cursor-pointer appearance-none rounded-full bg-foreground/10 outline-none",
                            "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-foreground [&::-webkit-slider-thumb]:cursor-grab [&::-webkit-slider-thumb]:active:cursor-grabbing [&::-webkit-slider-thumb]:shadow-[0_1px_2px_rgba(0,0,0,0.25)]",
                            "[&::-moz-range-thumb]:size-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-foreground [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-grab",
                          )}
                        />
                        <div className="mt-3 space-y-1 text-xs">
                          <div className="flex justify-between text-muted-foreground">
                            <span>Flat fee</span>
                            <span className="tabular-nums">{FLAT_FEE_SEK.toFixed(1)} SEK</span>
                          </div>
                          <div className="flex justify-between text-muted-foreground">
                            <span>Tokens</span>
                            <span className="tabular-nums">{tokensSek.toFixed(1)} SEK</span>
                          </div>
                          <div className="flex justify-between text-muted-foreground">
                            <span>Markup (10%)</span>
                            <span className="tabular-nums">{markupSek.toFixed(1)} SEK</span>
                          </div>
                          <div className="mt-1 pt-1.5 border-t border-border flex items-baseline justify-between">
                            <span className="text-sm font-semibold text-foreground">Total</span>
                            <span className="leading-none">
                              <span className="text-muted-foreground text-xs">≈</span>
                              <span className="ml-1 text-lg font-bold text-foreground tabular-nums">
                                {monthlyTotalSek.toFixed(1)}
                              </span>
                              <span className="ml-1 text-[10px] text-muted-foreground">SEK / mo</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 flex justify-center">
                        <span className="inline-flex items-center rounded-full bg-foreground/[0.06] px-2.5 py-1 text-xs font-medium text-foreground/85">
                          No add-on fees
                        </span>
                      </div>
                    </div>
                  </div>
                );
              }
              if (d.label === "Services") {
                return (
                  <div key={d.label} className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-2">
                    {itemList}
                    <div className="border-t lg:border-t-0 lg:border-l border-border pt-3 lg:pt-3 lg:pl-4 lg:pr-3 lg:py-3 px-3 pb-3 text-left">
                      <p className="leading-tight">
                        <span className="text-3xl font-bold text-foreground">Hourly</span>
                        <span className="ml-1.5 text-xs text-muted-foreground">billing rate</span>
                      </p>

                      <div className="mt-4 pt-3 border-t border-border">
                        <p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground font-semibold">
                          How we partner
                        </p>
                        <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                          A full financial partner for every part of your business. We work with a select group of clients and grow alongside them.
                        </p>
                      </div>
                    </div>
                  </div>
                );
              }
              return <div key={d.label}>{itemList}</div>;
            })}
          </div>
        </div>
      </header>
    </div>
    </>
  );
}
