"use client";

import Image from "next/image";
import { useState } from "react";
import { DownloadIcon } from "@/components/icons";
import { agenticGuides, aiToolLogos, siteCopy } from "@/lib/content";
import { cn } from "@/lib/utils";

export function AgenticGuides() {
  const [activeId, setActiveId] = useState(agenticGuides[0].id);
  const active = agenticGuides.find((g) => g.id === activeId)!;
  const c = siteCopy.agenticGuides;

  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <Image src={c.backgroundImage} alt="" fill sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-background/85" />
      </div>

      <div className="mx-auto max-w-6xl px-6 lg:px-12 text-center">
        <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-black tracking-[0.02em] text-foreground">
          {c.heading}
        </h2>
        <p className="mt-4 text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
          {c.sub}
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
          {agenticGuides.map((g) => {
            const isActive = g.id === activeId;
            return (
              <button
                key={g.id}
                type="button"
                onClick={() => setActiveId(g.id)}
                className={cn(
                  "h-10 px-5 rounded-[2px] text-sm font-semibold transition-all border border-border",
                  isActive
                    ? "bg-card text-foreground"
                    : "bg-transparent text-muted-foreground hover:text-foreground hover:bg-white/[0.04]",
                )}
                title={`${g.title} ${g.stats}`}
              >
                {g.label}
              </button>
            );
          })}
        </div>

        <div className="mt-10 grid lg:grid-cols-[1fr_auto] gap-6 items-stretch">
          <div className="bg-card border border-border rounded-[4px] p-8 text-left">
            <p className="text-[11px] uppercase tracking-[0.18em] text-subtle-foreground font-semibold">
              {c.downloadLabel}
            </p>
            <h3 className="font-display mt-3 text-3xl md:text-4xl font-black text-foreground">
              {active.title}
            </h3>
            <p className="mt-3 text-base text-muted-foreground max-w-xl">
              {active.description}
            </p>
            <form
              className="mt-6 flex flex-col sm:flex-row gap-2 max-w-lg"
              onSubmit={(e) => e.preventDefault()}
            >
              <input
                type="email"
                required
                placeholder={c.emailPlaceholder}
                className="flex-1 h-10 px-3 rounded-[10px] bg-layer-3 border border-input text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
              />
              <button
                type="submit"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-[10px] bg-foreground px-5 text-sm font-semibold text-background hover:bg-foreground/85 transition-colors"
              >
                <DownloadIcon className="size-4" />
                {c.submitLabel}
              </button>
            </form>
            <p className="mt-3 text-xs text-muted-foreground">{c.successHint}</p>
          </div>

          <div className="bg-card border border-border rounded-[4px] p-8 flex flex-col gap-4 min-w-[260px]">
            <p className="text-[11px] uppercase tracking-[0.18em] text-subtle-foreground font-semibold">
              {c.aiToolsLabel}
            </p>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="size-8 grid place-items-center rounded-[4px] bg-layer-3 border border-border text-[10px] font-bold text-foreground">
                  CC
                </div>
                <span className="text-sm font-semibold text-foreground">Claude Code</span>
              </div>
              {aiToolLogos.map((t) => (
                <div key={t.name} className="flex items-center gap-3">
                  <Image src={t.src} alt={t.name} width={32} height={32} className="size-8 object-contain rounded-[4px]" />
                  <span className="text-sm font-semibold text-foreground">{t.name}</span>
                </div>
              ))}
              <div className="flex items-center gap-3">
                <div className="size-8 grid place-items-center rounded-[4px] bg-blue-main text-[10px] font-bold text-white">
                  M
                </div>
                <span className="text-sm font-semibold text-foreground">Micro</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
