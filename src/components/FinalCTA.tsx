import Image from "next/image";
import { siteCopy } from "@/lib/content";
import { WaitlistForm } from "@/components/WaitlistForm";

export function FinalCTA() {
  const c = siteCopy.finalCta;
  return (
    <section className="relative flex items-center overflow-hidden scroll-mt-24 min-h-[560px] md:min-h-[680px]">
      {/* Grass image as full-section backdrop. Wider than viewport so the
          source image's bottom-right Gemini watermark is clipped by the
          section's overflow-hidden. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 w-[112%]"
      >
        <Image
          src={c.grassImage}
          alt=""
          fill
          sizes="120vw"
          className="object-cover object-bottom"
        />
        {/* Soft top blend so the section transitions in from above. */}
        <div
          className="absolute inset-x-0 top-0 h-40"
          style={{
            background:
              "linear-gradient(to bottom, var(--color-background) 0%, transparent 100%)",
          }}
        />
      </div>

      {/* Overlaid content */}
      <div className="relative z-10 mx-auto w-full max-w-6xl px-6 lg:px-12 text-center py-20 md:py-28">
        <h2 className="font-display text-5xl md:text-7xl lg:text-[110px] font-black tracking-[0.01em] text-black leading-none drop-shadow-[0_2px_8px_rgba(255,255,255,0.35)]">
          {c.heading}
        </h2>
        <div className="mt-10 flex justify-center">
          <WaitlistForm />
        </div>
      </div>
    </section>
  );
}
