import Image from "next/image";
import { testimonial } from "@/lib/content";

export function Testimonial() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src="/images/igdrasil-meadow.webp"
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-top scale-[1.85]"
        />
        {/* Soft fade at the seams only — keep the sky image visible across most of the section */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, var(--color-background) 0%, transparent 12%, transparent 88%, var(--color-background) 100%)",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl px-6 lg:px-12 py-32 md:py-40 text-center">
        <p className="font-display text-2xl md:text-4xl lg:text-[44px] leading-tight text-foreground">
          <span aria-hidden="true">&ldquo;</span>
          {testimonial.quote}
          <span aria-hidden="true">&rdquo;</span>
        </p>
        <div className="mt-10 flex flex-col items-center gap-2">
          <Image
            src={testimonial.avatar}
            alt={testimonial.author}
            width={48}
            height={48}
            className="size-12 rounded-full object-cover"
          />
          <div className="text-sm font-semibold text-foreground">{testimonial.author}</div>
          <div className="text-xs text-muted-foreground">{testimonial.role}</div>
        </div>
      </div>
    </section>
  );
}
