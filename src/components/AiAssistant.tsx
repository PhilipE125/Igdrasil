"use client";

import { useState } from "react";
import { aiItems, siteCopy } from "@/lib/content";
import { cn } from "@/lib/utils";

export function AiAssistant() {
  const [activeId, setActiveId] = useState(aiItems[0].id);
  const { heading, sub, workingCardLabel, workingLines } = siteCopy.ai;

  return (
    <section
      id="ai"
      className="bg-background @container flex min-h-dvh items-center py-24"
    >
      <div className="mx-auto w-full max-w-6xl px-6 lg:px-12">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-black tracking-[0.02em] text-foreground">
            {heading}
          </h2>
          <p className="mt-4 text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            {sub}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="flex flex-col gap-3">
            {aiItems.map((item) => {
              const open = activeId === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-expanded={open}
                  onClick={() => setActiveId(item.id)}
                  className={cn(
                    "text-left p-5 border border-border transition-all rounded-2xl",
                    open ? "bg-card" : "bg-transparent hover:bg-white/[0.02]",
                  )}
                >
                  <p className="text-base md:text-lg leading-snug text-foreground">
                    <span className="font-semibold">{item.leadPhrase}</span>{" "}
                    <span className="text-muted-foreground">— {item.description}</span>
                  </p>
                </button>
              );
            })}
          </div>

          <div className="relative aspect-[4/3] bg-card border border-border rounded-3xl overflow-hidden">
            <div className="absolute inset-0 dither-lg opacity-[0.15]" />
            <div className="absolute inset-0 grid place-items-center p-8">
              <div className="bg-layer-3 ring-1 ring-foreground/10 rounded-[8px] p-5 max-w-sm w-full shadow-2xl">
                <div className="flex items-center gap-2 pb-3 border-b border-border">
                  <div className="size-2 rounded-full bg-blue-main animate-pulse" />
                  <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                    {workingCardLabel}
                  </span>
                </div>
                <div className="mt-4 space-y-2 text-[13px] text-foreground/85">
                  {workingLines.map((line, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-muted-foreground/60">›</span>
                      <span>{line}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
