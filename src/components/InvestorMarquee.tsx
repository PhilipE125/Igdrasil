import Image from "next/image";
import { investors, siteCopy } from "@/lib/content";

export function InvestorMarquee() {
  const { lead, emphasis, conjunction, final } = siteCopy.investors;
  return (
    <section className="bg-background relative overflow-hidden py-16 md:py-20">
      <div className="mx-auto max-w-6xl px-6 text-center lg:px-12">
        <p className="text-sm md:text-base text-muted-foreground">
          {lead}{" "}
          <span className="text-foreground font-semibold">{emphasis[0]}</span>,{" "}
          <span className="text-foreground font-semibold">{emphasis[1]}</span>,{" "}
          {conjunction}{" "}
          <span className="text-foreground font-semibold">{final}</span>.
        </p>
      </div>

      <div className="mt-10 flex flex-wrap items-center justify-center gap-x-12 gap-y-6 px-6">
        {investors.map((logo) => (
          <div key={logo.name} className="flex items-center gap-2.5 opacity-80 hover:opacity-100 transition-opacity">
            <Image src={logo.src} alt={logo.alt} width={28} height={28} className="h-7 w-7 object-contain" />
            <span className="text-sm font-medium text-foreground/85">{logo.name}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
