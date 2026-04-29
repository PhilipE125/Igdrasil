"use client";

import { useState } from "react";
import Link from "next/link";
import { automationsTabs, promptCards, siteCopy } from "@/lib/content";
import { cn } from "@/lib/utils";

export function AutomationSkills() {
  const [activeTab, setActiveTab] = useState(automationsTabs[0].id);
  const cards = automationsTabs.find((t) => t.id === activeTab)?.cards ?? [];
  const { heading, sub } = siteCopy.automations;

  return (
    <section
      id="automations"
      className="bg-background flex min-h-dvh flex-col items-center justify-center py-24"
    >
      <div className="mx-auto w-full max-w-6xl px-6 lg:px-12">
        <div className="text-center mb-10">
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-black tracking-[0.02em] text-foreground">
            {heading}
          </h2>
          <p className="mt-4 text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            {sub}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {automationsTabs.map((tab) => {
            const isActive = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "h-9 px-4 rounded-[2px] text-sm font-semibold transition-all",
                  isActive
                    ? "bg-card text-foreground border border-border"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/[0.04]",
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {cards.map((card) => (
            <Link
              key={card.title}
              href={card.href}
              className="group border border-border bg-card hover:bg-layer-3 transition-colors p-5 rounded-[2px]"
            >
              <div className="text-2xl mb-3" aria-hidden="true">{card.emoji}</div>
              <h3 className="text-base font-semibold text-foreground group-hover:underline">
                {card.title}
              </h3>
              <p className="mt-1.5 text-sm text-muted-foreground leading-snug">
                {card.description}
              </p>
            </Link>
          ))}
        </div>

        <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-2">
          {promptCards.map((p) => (
            <div
              key={p.title}
              className="border border-border p-4 rounded-[2px] bg-layer-2/40"
            >
              <h3 className="text-sm font-semibold text-foreground">{p.title}</h3>
              <p className="mt-1 text-xs text-muted-foreground leading-snug">
                {p.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
