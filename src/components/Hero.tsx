"use client";

import Image from "next/image";
import { useState } from "react";
import { DemoApp } from "@/components/DemoApp";
import { siteCopy } from "@/lib/content";

export function Hero() {
  const { hero } = siteCopy;
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    setTimeout(() => {
      setStatus("success");
      setEmail("");
    }, 1200);
  };
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
          className="size-full object-contain object-top scale-[1.13] rotate-[0.5deg]"
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
            className="mb-5 inline-flex h-7 items-center rounded-[8px] border border-input bg-layer-3 px-3 text-sm font-semibold text-foreground transition-all btn-hover-overlay"
          >
            {hero.launchVideoLabel}
          </button>

          <h1 className="font-display text-balance text-4xl font-black tracking-[0.02em] sm:text-6xl lg:text-7xl text-black lg:leading-none">
            {hero.heading}
          </h1>
          <p className="text-pretty text-black/80 mx-auto mt-6 mb-8 max-w-2xl text-lg lg:text-xl">
            {hero.sub}
          </p>

          <div
            id="waitlist"
            className="mx-auto flex w-full max-w-md flex-col items-center gap-2 scroll-mt-24"
          >
            {status === "success" ? (
              <p className="h-11 inline-flex items-center text-base font-semibold text-foreground">
                You&apos;re on the list. We&apos;ll be in touch.
              </p>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="flex w-full items-center gap-2"
              >
                <input
                  id="waitlist-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  disabled={status === "loading"}
                  aria-label="Email address"
                  className="h-11 flex-1 rounded-[10px] border border-input bg-layer-3 px-4 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground/40 focus:ring-2 focus:ring-foreground/15 transition-all"
                />
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="inline-flex h-11 items-center justify-center rounded-[10px] bg-foreground px-6 text-base font-semibold text-background shadow-[inset_0_-2px_0_0_rgba(0,0,0,0.2)] hover:bg-foreground/85 hover:shadow-none disabled:opacity-70 disabled:cursor-not-allowed transition-all"
                >
                  {status === "loading" ? "…" : hero.primaryCta.label}
                </button>
              </form>
            )}
            <p className="text-sm text-black/70">
              Join waitlist for free onboarding
            </p>
          </div>
        </div>
      </div>

      <DemoApp />
    </section>
  );
}
