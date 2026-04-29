import Image from "next/image";
import { PlayIcon } from "@/components/icons";
import { scaleCards, siteCopy } from "@/lib/content";

export function BuiltToScale() {
  const { heading, sub, videoCard } = siteCopy.builtToScale;
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
          {scaleCards.map((card, i) => (
            <div
              key={card.title}
              className="border border-border bg-card p-6 rounded-[2px] flex flex-col gap-2"
              style={{ minHeight: 200 }}
            >
              <div className="size-8 rounded-[2px] bg-layer-3 border border-border grid place-items-center text-xs font-bold text-muted-foreground">
                {i + 1}
              </div>
              <h3 className="text-lg font-semibold text-foreground mt-2">
                {card.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-snug">
                {card.description}
              </p>
            </div>
          ))}

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
