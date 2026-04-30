import Image from "next/image";

type Logo = { name: string; file: string; sizeClass?: string };

const ACCOUNTING: Logo[] = [
  { name: "Fortnox", file: "fortnox.png" },
  { name: "Bokio", file: "bokio.png" },
  { name: "Visma", file: "visma.png", sizeClass: "max-h-14" },
  { name: "Björn Lundén", file: "bjornlunden.webp" },
  { name: "Briox", file: "briox.png" },
];

const BANKS: Logo[] = [
  { name: "Handelsbanken", file: "handelsbanken.png" },
  { name: "Nordea", file: "nordea.png" },
  { name: "SEB", file: "seb.png" },
  { name: "Swedbank", file: "swedbank.webp" },
  { name: "Lunar", file: "lunar.svg" },
  { name: "Juni", file: "juni.svg" },
];

const AUTHORITY: Logo[] = [
  { name: "Skatteverket", file: "skatteverket.svg" },
];

function LogoTile({ logo }: { logo: Logo }) {
  return (
    <div
      className="flex items-center justify-center h-16 w-36 flex-shrink-0 px-4 grayscale-0 opacity-100 hover:grayscale hover:opacity-60 transition-all duration-300"
      title={logo.name}
    >
      <Image
        src={`/logos/integrations/${logo.file}`}
        alt={logo.name}
        width={144}
        height={64}
        className={`${logo.sizeClass ?? "max-h-8"} max-w-full w-auto h-auto object-contain`}
      />
    </div>
  );
}

function MarqueeRow({
  logos,
  duration,
}: {
  logos: Logo[];
  duration: string;
}) {
  const doubled = [...logos, ...logos];
  return (
    <div
      className="overflow-hidden relative group"
      style={{
        maskImage:
          "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
        WebkitMaskImage:
          "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
      }}
    >
      <div
        className="flex w-max animate-marquee-scroll group-hover:[animation-play-state:paused]"
        style={{ ["--marquee-duration" as string]: duration }}
      >
        {doubled.map((logo, i) => (
          <LogoTile key={`${logo.file}-${i}`} logo={logo} />
        ))}
      </div>
    </div>
  );
}

export function Integrations() {
  return (
    <section className="max-w-5xl mx-auto pt-12 pb-8">
      <div className="space-y-6">
        <div>
          <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-[0.2em] mb-3 text-center">
            Accounting software
          </p>
          <MarqueeRow logos={ACCOUNTING} duration="40s" />
        </div>
        <div>
          <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-[0.2em] mb-3 text-center">
            Banks
          </p>
          <MarqueeRow logos={BANKS} duration="28s" />
        </div>
        <div>
          <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-[0.2em] mb-3 text-center">
            Tax authority
          </p>
          <div className="flex justify-center">
            <LogoTile logo={AUTHORITY[0]} />
          </div>
        </div>
      </div>
    </section>
  );
}
