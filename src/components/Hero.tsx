import Image from "next/image";
import Link from "next/link";
import { HeroAppMockup } from "@/components/HeroAppMockup";
import { siteCopy } from "@/lib/content";

export function Hero() {
  const { hero } = siteCopy;
  return (
    <section className="bg-background relative">
      <div
        aria-hidden="true"
        className="dither-xl pointer-events-none absolute inset-0 opacity-[0.25]"
        style={{
          maskImage:
            "radial-gradient(48% 25% at 50% 56%, black 0%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(48% 25% at 50% 56%, black 0%, transparent 100%)",
        }}
      />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden z-0">
        <Image
          src={hero.backgroundImage}
          alt=""
          fill
          priority
          sizes="100vw"
          className="size-full object-cover scale-[1.4] -translate-y-[17%] rotate-[0.5deg]"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, transparent 50%, var(--color-background) 75%, var(--color-background) 100%)",
          }}
        />
      </div>

      <div className="relative z-10 pt-24 md:pt-32 lg:pt-40 pb-20">
        <div className="mx-auto max-w-6xl px-6 text-center lg:px-12">
          <button
            type="button"
            className="mb-5 inline-flex h-7 items-center gap-1.5 rounded-[8px] border border-input bg-layer-3 pr-2 pl-1 text-sm font-semibold text-foreground transition-all btn-hover-overlay"
          >
            <Image
              src={hero.launchVideoThumb}
              alt="Launch video"
              width={32}
              height={18}
              className="h-5 w-8 rounded-[5px] object-cover"
            />
            {hero.launchVideoLabel}
          </button>

          <h1 className="font-display text-balance text-4xl font-black tracking-[0.02em] sm:text-6xl lg:text-7xl text-white lg:leading-none">
            {hero.heading}
          </h1>
          <p className="text-pretty text-white/90 mx-auto mt-6 mb-8 max-w-2xl text-lg lg:text-xl">
            {hero.sub}
          </p>

          <div className="flex flex-col items-center justify-center gap-3 max-sm:w-full sm:flex-row">
            <Link
              href={hero.primaryCta.href}
              className="inline-flex h-10 items-center justify-center rounded-[10px] bg-foreground px-6 text-base font-semibold text-background shadow-[inset_0_-2px_0_0_rgba(0,0,0,0.2)] hover:bg-foreground/85 hover:shadow-none transition-all max-sm:w-full"
            >
              {hero.primaryCta.label}
            </Link>
            <button
              type="button"
              className="btn-hover-overlay inline-flex h-10 items-center justify-center rounded-[10px] border border-input bg-layer-3 px-6 text-base font-semibold text-foreground max-sm:w-full"
            >
              {hero.secondaryCta.label}
            </button>
          </div>
        </div>

        <HeroAppMockup />
      </div>
    </section>
  );
}
