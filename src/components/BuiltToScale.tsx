import Image from "next/image";
import { AccountingPipelineDemo } from "@/components/NeverThink";
import { PlayIcon } from "@/components/icons";
import { scaleCards, siteCopy } from "@/lib/content";

export function BuiltToScale() {
  const { heading, sub, videoCard } = siteCopy.builtToScale;
  const [collaboration, ...rest] = scaleCards;
  return (
    <section className="bg-background @container flex min-h-dvh items-center py-24">
      <div className="mx-auto w-full max-w-6xl px-6 lg:px-12">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-black tracking-[0.02em] text-foreground">
            {heading}
          </h2>
          <p className="mt-4 text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            {sub}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {/* Big Collaboration card with embedded accounting pipeline demo */}
          <div className="lg:col-span-3 border border-border bg-card rounded-[2px] overflow-hidden">
            <div className="p-5 sm:p-6 border-b border-border/60">
              <div className="size-8 rounded-[2px] bg-layer-3 border border-border grid place-items-center text-xs font-bold text-muted-foreground">
                1
              </div>
              <h3 className="text-xl font-semibold text-foreground mt-3">
                {collaboration.title}
              </h3>
              <p className="mt-1.5 text-sm text-muted-foreground max-w-2xl">
                {collaboration.description}
              </p>
            </div>
            <div className="p-2 sm:p-3 lg:p-4">
              <AccountingPipelineDemo />
            </div>
          </div>

          {rest.map((card, i) => {
            if (card.title === "Speed") {
              return (
                <div
                  key={card.title}
                  className="border border-gray-200/70 bg-white text-gray-900 p-6 rounded-[2px] flex flex-col"
                  style={{ minHeight: 340 }}
                >
                  <h3 className="text-lg font-semibold">{card.title}</h3>
                  <p className="text-sm text-gray-500 leading-snug mt-2">
                    {card.description}
                  </p>

                  <div className="flex-1 flex items-center justify-center pt-6">
                    <div className="relative w-[240px] h-[160px] grid place-items-center">
                      {/* horizontal dashed guides aligned to top/bottom of keys */}
                      <div className="absolute left-0 right-0 top-[46px] border-t border-dashed border-gray-200/60" />
                      <div className="absolute left-0 right-0 bottom-[46px] border-t border-dashed border-gray-200/60" />
                      {/* vertical dashed guides aligned to key edges */}
                      <div className="absolute top-0 bottom-0 left-[44px] border-l border-dashed border-gray-200/60" />
                      <div className="absolute top-0 bottom-0 left-[112px] border-l border-dashed border-gray-200/60" />
                      <div className="absolute top-0 bottom-0 right-[112px] border-l border-dashed border-gray-200/60" />
                      <div className="absolute top-0 bottom-0 right-[44px] border-l border-dashed border-gray-200/60" />

                      {/* keycaps */}
                      <div className="relative z-10 flex items-center gap-3">
                        <div
                          className="h-[64px] w-[64px] rounded-[14px] flex items-center justify-center text-[26px] text-gray-900 select-none"
                          style={{
                            background:
                              "linear-gradient(180deg, #ffffff 0%, #f5f5f7 100%)",
                            boxShadow:
                              "inset 0 1px 0 rgba(255,255,255,1), inset 0 -2px 0 rgba(0,0,0,0.06), 0 1px 1px rgba(0,0,0,0.04), 0 4px 8px -2px rgba(0,0,0,0.10), 0 12px 24px -6px rgba(0,0,0,0.18)",
                            border: "1px solid rgba(0,0,0,0.08)",
                          }}
                        >
                          ⌘
                        </div>
                        <div
                          className="h-[64px] w-[64px] rounded-[14px] flex items-center justify-center text-[24px] font-medium text-gray-900 select-none"
                          style={{
                            background:
                              "linear-gradient(180deg, #ffffff 0%, #f5f5f7 100%)",
                            boxShadow:
                              "inset 0 1px 0 rgba(255,255,255,1), inset 0 -2px 0 rgba(0,0,0,0.06), 0 1px 1px rgba(0,0,0,0.04), 0 4px 8px -2px rgba(0,0,0,0.10), 0 12px 24px -6px rgba(0,0,0,0.18)",
                            border: "1px solid rgba(0,0,0,0.08)",
                          }}
                        >
                          K
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }
            return (
              <div
                key={card.title}
                className="border border-border bg-card p-6 rounded-[2px] flex flex-col gap-2"
                style={{ minHeight: 200 }}
              >
                <div className="size-8 rounded-[2px] bg-layer-3 border border-border grid place-items-center text-xs font-bold text-muted-foreground">
                  {i + 2}
                </div>
                <h3 className="text-lg font-semibold text-foreground mt-2">
                  {card.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-snug">
                  {card.description}
                </p>
              </div>
            );
          })}

          <div className="lg:col-span-3 border border-border bg-card rounded-[2px] overflow-hidden grid lg:grid-cols-2">
            <div className="p-8">
              <h3 className="text-2xl font-semibold text-foreground">{videoCard.title}</h3>
              <p className="mt-2 text-base text-muted-foreground max-w-md">
                {videoCard.sub}
              </p>
              <button
                type="button"
                aria-label="Play video"
                className="mt-6 inline-flex h-10 items-center gap-2 rounded-[10px] bg-foreground px-5 text-sm font-semibold text-background hover:bg-foreground/85 transition-colors"
              >
                <PlayIcon className="size-3.5" />
                {videoCard.cta}
              </button>
            </div>
            <div className="relative min-h-[260px] bg-layer-3">
              <Image
                src={videoCard.poster}
                alt=""
                fill
                sizes="50vw"
                className="object-cover opacity-80"
              />
              <div className="absolute inset-0 grid place-items-center">
                <div className="size-14 rounded-full bg-white/20 backdrop-blur grid place-items-center">
                  <PlayIcon className="size-5 text-white translate-x-0.5" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
