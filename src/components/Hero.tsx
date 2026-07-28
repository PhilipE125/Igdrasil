"use client";

import Image from "next/image";
import { ArmedCta } from "@/components/ArmedCta";
import { DemoApp } from "@/components/DemoApp";
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
          className="size-full object-cover sm:object-contain object-top scale-[1.13] rotate-[0.5deg]"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, transparent 50%, var(--color-background) 75%, var(--color-background) 100%)",
          }}
        />
      </div>

      <div className="relative z-10 pt-24 md:pt-32 lg:pt-40 pb-0">
        <div className="mx-auto max-w-6xl px-6 text-center lg:px-12">
          <h1 className="font-display text-balance text-4xl font-black tracking-[0.02em] sm:text-6xl lg:text-7xl text-black lg:leading-none">
            {hero.heading}
          </h1>
          <p className="text-pretty text-black/80 mx-auto mt-6 mb-8 max-w-2xl text-lg lg:text-xl">
            {hero.sub}
          </p>

          <div className="mx-auto flex w-full max-w-md flex-col items-center">
            <ArmedCta
              href={hero.primaryCta.href}
              label={hero.primaryCta.label}
              armedLabel={hero.primaryCta.armedLabel}
              caption={hero.primaryCta.caption}
            />
          </div>
        </div>
      </div>

      <DemoApp />

      <div className="md:hidden relative z-10 mt-6 mb-2 flex flex-col items-center gap-1.5 px-4">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap">
          {hero.beta.offer}
        </span>
        <div className="inline-flex max-w-[calc(100vw-2rem)] items-center gap-x-2 rounded-full bg-popover/70 ring-1 ring-border shadow-md shadow-black/[0.065] backdrop-blur-xl px-4 py-1.5 leading-tight">
          <span className="font-display text-sm font-bold text-foreground whitespace-nowrap">
            {hero.beta.price}
          </span>
          <span className="font-display text-sm font-bold text-foreground whitespace-nowrap">
            {hero.beta.markup}
          </span>
        </div>
      </div>
    </section>
  );
}
