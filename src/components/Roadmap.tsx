import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import type { RoadmapMilestone } from "@/types/content";
import { roadmapMilestones, siteCopy } from "@/lib/content";
import { cn } from "@/lib/utils";

const STATUS_PILL: Record<string, string> = {
  live: "bg-emerald-500/15 border-emerald-500/30",
  now: "bg-amber-400/15 border-amber-400/40",
  soon: "bg-sky-400/10 border-sky-400/30",
  next: "bg-sky-400/10 border-sky-400/30",
  later: "bg-white/[0.03] border-white/10",
};

export function Roadmap() {
  const c = siteCopy.roadmap;

  return (
    <section className="relative py-14 md:py-16 overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <Image
          src={c.backgroundImage}
          alt=""
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-background/90" />
      </div>

      <div className="mx-auto max-w-5xl px-6 lg:px-12">
        <div className="text-center">
          <p className="text-[11px] uppercase tracking-[0.22em] text-subtle-foreground font-semibold">
            {c.eyebrow}
          </p>
          <h2 className="mt-3 font-display text-3xl md:text-5xl font-black tracking-[0.02em] text-foreground">
            {c.heading}
          </h2>
          <p className="mt-3 text-sm md:text-base text-muted-foreground max-w-xl mx-auto">
            {c.sub}
          </p>
          <a
            href={c.repoHref}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-foreground hover:text-primary transition-colors"
          >
            {c.repoLabel}
            <ArrowUpRight className="size-4" />
          </a>
        </div>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-3">
          {roadmapMilestones.map((m) =>
            m.highlighted ? (
              <HeroCard key={m.id} milestone={m} />
            ) : (
              <Card key={m.id} milestone={m} />
            ),
          )}
        </div>
      </div>
    </section>
  );
}

function HeroCard({ milestone: m }: { milestone: RoadmapMilestone }) {
  const Icon = m.Icon;
  return (
    <div className="md:col-span-2 relative overflow-hidden rounded-[6px] border border-amber-400/30 bg-card p-5 md:p-6">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-16 -right-12 size-48 rounded-full bg-amber-400/10 blur-2xl"
      />
      <div className="relative flex items-start gap-4">
        <div className="grid place-items-center shrink-0 size-11 rounded-[6px] bg-amber-400/15 border border-amber-400/40">
          <Icon className="size-5 text-amber-200" />
        </div>
        <div className="min-w-0 flex-1">
          <span
            style={{ color: "#000" }}
            className={cn(
              "inline-flex items-center h-6 px-2.5 rounded-full border text-[10.5px] font-bold uppercase tracking-[0.14em]",
              STATUS_PILL[m.status],
            )}
          >
            {m.statusLabel}
          </span>
          <h3 className="mt-2 font-display text-xl md:text-2xl font-black text-foreground leading-tight">
            {m.title}
          </h3>
          <p className="mt-1.5 text-sm md:text-[15px] text-muted-foreground max-w-xl">
            {m.description}
          </p>
        </div>
      </div>
    </div>
  );
}

function Card({ milestone: m }: { milestone: RoadmapMilestone }) {
  const Icon = m.Icon;
  return (
    <div className="rounded-[6px] border border-border bg-card/80 p-4 md:p-5 hover:border-white/20 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="grid place-items-center shrink-0 size-9 rounded-[6px] bg-layer-3 border border-border">
          <Icon className="size-4 text-foreground" />
        </div>
        <span
          style={{ color: "#000" }}
          className={cn(
            "inline-flex items-center h-5 px-2 rounded-full border text-[10px] font-bold uppercase tracking-[0.14em]",
            STATUS_PILL[m.status],
          )}
        >
          {m.statusLabel}
        </span>
      </div>
      <h3 className="mt-3 font-display text-base md:text-lg font-bold text-foreground leading-tight">
        {m.title}
      </h3>
      <p className="mt-1.5 text-sm text-muted-foreground leading-snug">
        {m.description}
      </p>
    </div>
  );
}
