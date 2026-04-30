"use client";

import Image from "next/image";
import { useState } from "react";
import { ChevronDownIcon } from "@/components/icons";
import {
  productFeatureRows,
  serviceFeatureRows,
  siteCopy,
} from "@/lib/content";
import { cn } from "@/lib/utils";

type Tab = "product" | "services";

export function ProductFeatures() {
  const [tab, setTab] = useState<Tab>("product");
  const rows = tab === "product" ? productFeatureRows : serviceFeatureRows;
  const [openId, setOpenId] = useState<string>("");
  const { heading, productSub, servicesSub, replacesLabel } = siteCopy.product;
  const sub = tab === "product" ? productSub : servicesSub;

  const switchTab = (next: Tab) => {
    if (next === tab) return;
    setTab(next);
    setOpenId("");
  };

  return (
    <section
      id="product"
      className="bg-background @container flex min-h-dvh items-center py-24"
    >
      <div className="mx-auto w-full max-w-6xl px-6 lg:px-12">
        <div className="text-center mb-10 md:mb-12">
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-black tracking-[0.02em] text-foreground">
            {heading}
          </h2>
          <p className="mt-4 text-base md:text-lg text-muted-foreground max-w-xl mx-auto">
            {sub}
          </p>
        </div>

        <div className="mb-10 flex justify-center">
          <div
            role="tablist"
            aria-label="Product or services"
            className="inline-flex rounded-full border border-border bg-card p-1 shadow-sm"
          >
            {(["product", "services"] as const).map((t) => {
              const active = tab === t;
              return (
                <button
                  key={t}
                  role="tab"
                  type="button"
                  aria-selected={active}
                  onClick={() => switchTab(t)}
                  className={cn(
                    "px-5 py-1.5 rounded-full text-sm font-semibold transition-colors",
                    active
                      ? "bg-foreground text-background shadow-[inset_0_-2px_0_0_rgba(0,0,0,0.2)]"
                      : "text-foreground/70 hover:text-foreground",
                  )}
                >
                  {t === "product" ? "Product" : "Services"}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mx-auto max-w-3xl">
          {rows.map((row, i) => {
            const open = openId === row.id;
            return (
              <div
                key={row.id}
                className={cn(
                  "border-t border-border",
                  i === rows.length - 1 && "border-b",
                )}
              >
                <button
                  type="button"
                  aria-expanded={open}
                  onClick={() => setOpenId(open ? "" : row.id)}
                  className="w-full flex items-center justify-between gap-4 py-5 text-left"
                >
                  <span className="text-xl md:text-2xl font-semibold text-foreground">
                    {row.title}
                  </span>
                  <ChevronDownIcon
                    className={cn(
                      "size-5 shrink-0 text-muted-foreground transition-transform",
                      open && "rotate-180",
                    )}
                  />
                </button>
                <div
                  className={cn(
                    "grid transition-all duration-300",
                    open ? "grid-rows-[1fr] pb-6" : "grid-rows-[0fr]",
                  )}
                >
                  <div className="overflow-hidden">
                    {row.badge && (
                      <span className="mb-3 inline-flex items-center rounded-full border border-border bg-foreground/[0.04] px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground whitespace-nowrap">
                        {row.badge}
                      </span>
                    )}
                    <p className="text-base md:text-lg text-foreground/85">
                      {row.description}
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">{row.detail}</p>
                    {row.replaces.length > 0 && (
                      <div className="mt-5 flex items-center gap-4">
                        <span className="text-xs uppercase tracking-wider text-subtle-foreground">
                          {replacesLabel}
                        </span>
                        <div className="flex items-center gap-3 opacity-90">
                          {row.replaces.map((r) => (
                            <Image
                              key={r.name}
                              src={r.src}
                              alt={r.name}
                              width={28}
                              height={28}
                              className="h-7 w-7 object-contain"
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
