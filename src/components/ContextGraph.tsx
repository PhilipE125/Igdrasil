import Image from "next/image";
import {
  contextCards,
  contextGraphFeatures,
  ecosystemLogos,
  siteCopy,
} from "@/lib/content";
import { cn } from "@/lib/utils";

export function ContextGraph() {
  const { heading, sub } = siteCopy.contextGraph;
  return (
    <section className="bg-background flex min-h-dvh flex-col justify-center py-24 overflow-hidden">
      <div className="mx-auto w-full max-w-6xl px-6 lg:px-12">
        <div className="text-center mb-12">
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-black tracking-[0.02em] text-foreground">
            {heading}
          </h2>
          <p className="mt-4 text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            {sub}
          </p>
        </div>
      </div>

      <div className="relative w-full mb-16">
        {/* 3 marquee tracks of decorative cards */}
        {[0, 1, 2].map((row) => (
          <div key={row} className="flex w-full overflow-hidden py-3">
            <div
              className={cn(
                "flex shrink-0 items-stretch gap-3 pr-3 animate-marquee-scroll",
                row === 1 && "[animation-direction:reverse]",
              )}
              style={{ ["--marquee-duration" as string]: row === 0 ? "70s" : row === 1 ? "55s" : "85s" }}
            >
              {[...contextCards, ...contextCards, ...contextCards].map((card, i) => (
                <ContextCard key={`${row}-${i}`} card={card} />
              ))}
            </div>
          </div>
        ))}

        {/* Ecosystem logos row at the bottom */}
        <div className="flex w-full overflow-hidden mt-6">
          <div
            className="flex shrink-0 items-center gap-12 pr-12 animate-marquee-scroll"
            style={{ ["--marquee-duration" as string]: "45s" }}
          >
            {[...ecosystemLogos, ...ecosystemLogos, ...ecosystemLogos].map((logo, i) => (
              <Image
                key={`${logo.name}-${i}`}
                src={logo.src}
                alt={logo.alt}
                width={64}
                height={28}
                className="h-7 w-auto opacity-50"
              />
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-6xl px-6 lg:px-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {contextGraphFeatures.map((c) => (
            <div key={c.title} className="border border-border bg-card p-5 rounded-[2px]">
              <h3 className="text-base font-semibold text-foreground">{c.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground leading-snug">
                {c.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ContextCard({
  card,
}: {
  card: (typeof contextCards)[number];
}) {
  return (
    <div className="w-[260px] shrink-0 border border-border bg-card rounded-[2px] p-4">
      <div className="flex items-center gap-2.5 mb-3">
        {card.iconSrc ? (
          <Image src={card.iconSrc} alt="" width={20} height={20} className="size-5 rounded-[3px]" />
        ) : (
          <div className="size-5 rounded-[3px] bg-blue-main/30 grid place-items-center text-[10px] font-semibold text-foreground">
            {card.kind.slice(0, 1).toUpperCase()}
          </div>
        )}
        <div className="min-w-0">
          <div className="text-[13px] font-semibold text-foreground truncate">
            {card.title}
          </div>
          <div className="text-[11px] text-muted-foreground truncate">
            {card.subtitle}
          </div>
        </div>
      </div>
      <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-[11px]">
        {card.fields.map((f) => (
          <div key={f.label} className="contents">
            <dt className="text-muted-foreground">{f.label}</dt>
            <dd className="text-foreground/90 truncate">{f.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
