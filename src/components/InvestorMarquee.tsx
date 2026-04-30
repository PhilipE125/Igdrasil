"use client";

import Link from "next/link";
import { siteCopy } from "@/lib/content";

export function InvestorMarquee() {
  const { text, beta } = siteCopy.investors;

  const focusWaitlist = (e: React.MouseEvent) => {
    if (beta.cta.href !== "#waitlist") return;
    e.preventDefault();
    const target = document.getElementById("waitlist");
    const input = document.getElementById("waitlist-email") as HTMLInputElement | null;
    target?.scrollIntoView({ behavior: "smooth", block: "center" });
    setTimeout(() => input?.focus({ preventScroll: true }), 600);
  };

  return (
    <section className="bg-background relative overflow-hidden py-16 md:py-20">
      <div className="mx-auto max-w-3xl px-6 text-center lg:px-12">
        <p className="text-base md:text-lg text-foreground/85">{text}</p>

        <div className="mt-10 mx-auto inline-flex flex-col items-center rounded-2xl border border-border bg-card px-6 py-6 sm:px-8 sm:py-7 shadow-sm">
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            {beta.eyebrow}
          </span>
          <p className="mt-3 text-sm font-semibold text-foreground">{beta.offer}</p>
          <p className="mt-1 leading-tight">
            <span className="font-display text-3xl sm:text-4xl font-bold text-foreground">
              {beta.price}
            </span>
          </p>
          <p className="mt-1 text-sm text-muted-foreground">{beta.markup}</p>
          <p className="mt-1 text-xs text-muted-foreground">{beta.note}</p>
          <Link
            href={beta.cta.href}
            onClick={focusWaitlist}
            className="mt-5 inline-flex h-10 items-center justify-center rounded-lg bg-foreground px-5 text-sm font-semibold text-background shadow-[inset_0_-2px_0_0_rgba(0,0,0,0.2)] hover:bg-foreground/85 hover:shadow-none transition-all"
          >
            {beta.cta.label}
          </Link>
        </div>
      </div>
    </section>
  );
}
