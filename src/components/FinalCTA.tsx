import Image from "next/image";
import { siteCopy } from "@/lib/content";
import { WaitlistForm } from "@/components/WaitlistForm";

export function FinalCTA() {
  const c = siteCopy.finalCta;
  return (
    <section id="waitlist" className="relative pt-12 md:pt-24 overflow-hidden scroll-mt-24">
      <div
        aria-hidden="true"
        className="dither-xl pointer-events-none absolute inset-0 opacity-[0.18]"
        style={{
          maskImage:
            "radial-gradient(48% 50% at 50% 35%, black 0%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(48% 50% at 50% 35%, black 0%, transparent 100%)",
        }}
      />
      <div className="relative mx-auto max-w-6xl px-6 lg:px-12 text-center pb-12">
        <h2 className="font-display text-5xl md:text-7xl lg:text-[110px] font-black tracking-[0.01em] text-foreground leading-none">
          {c.heading}
        </h2>
        <p className="mt-4 text-lg md:text-xl text-muted-foreground italic">
          {c.sub}
        </p>
        <div className="mt-10 flex justify-center">
          <WaitlistForm />
        </div>
      </div>

      {/* Grass field strip beneath the CTA */}
      <div className="relative w-full h-[260px] md:h-[340px]">
        <Image
          src={c.grassImage}
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-bottom"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, var(--color-background) 0%, transparent 35%)",
          }}
        />
      </div>
    </section>
  );
}
