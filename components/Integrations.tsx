import React from 'react';

type Logo = { name: string; file: string };

const ACCOUNTING: Logo[] = [
  { name: 'Fortnox', file: 'fortnox.png' },
  { name: 'Bokio', file: 'bokio.png' },
  { name: 'Visma', file: 'visma.png' },
  { name: 'Björn Lundén', file: 'bjornlunden.webp' },
  { name: 'Briox', file: 'briox.png' },
];

const BANKS: Logo[] = [
  { name: 'Handelsbanken', file: 'handelsbanken.png' },
  { name: 'Nordea', file: 'nordea.png' },
  { name: 'SEB', file: 'seb.png' },
  { name: 'Swedbank', file: 'swedbank.webp' },
  { name: 'Lunar', file: 'lunar.svg' },
  { name: 'Juni', file: 'juni.svg' },
];

const AUTHORITY: Logo[] = [
  { name: 'Skatteverket', file: 'skatteverket.svg' },
];

const LogoTile: React.FC<{ logo: Logo }> = ({ logo }) => (
  <div
    className="flex items-center justify-center h-16 w-36 flex-shrink-0 px-4 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300"
    title={logo.name}
  >
    <img
      src={`/logos/integrations/${logo.file}`}
      alt={logo.name}
      className="max-h-8 max-w-full object-contain"
      loading="lazy"
    />
  </div>
);

type MarqueeRowProps = {
  logos: Logo[];
  speedClass: string;
};

const MarqueeRow: React.FC<MarqueeRowProps> = ({ logos, speedClass }) => {
  const doubled = [...logos, ...logos];
  return (
    <div
      className="overflow-hidden relative group"
      style={{
        maskImage:
          'linear-gradient(to right, transparent, black 8%, black 92%, transparent)',
        WebkitMaskImage:
          'linear-gradient(to right, transparent, black 8%, black 92%, transparent)',
      }}
    >
      <div
        className={`flex w-max ${speedClass} group-hover:[animation-play-state:paused]`}
      >
        {doubled.map((logo, i) => (
          <LogoTile key={`${logo.file}-${i}`} logo={logo} />
        ))}
      </div>
    </div>
  );
};

const Integrations: React.FC = () => {
  return (
    <section
      id="integrations"
      aria-labelledby="integrations-heading"
      className="max-w-5xl mx-auto pt-12 pb-8 scroll-mt-24"
    >
      <div className="text-center mb-10">
        <p className="text-sm font-mono uppercase tracking-wider mb-4">
          <span className="text-igdrasil-accent font-medium">02</span>
          <span className="text-gray-400 mx-2">&mdash;</span>
          <span className="text-igdrasil-accent">Works with</span>
        </p>
        <h2
          id="integrations-heading"
          className="text-3xl md:text-4xl font-light text-gray-900 tracking-tight"
        >
          Plugs into your existing stack
        </h2>
        <p className="text-base text-gray-600 font-light mt-3 max-w-xl mx-auto leading-relaxed">
          Accounting software, banks, and authorities &mdash; we work with the
          tools Swedish companies already rely on.
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <p className="text-[10px] font-mono text-gray-500 uppercase tracking-[0.2em] mb-3 text-center">
            Accounting software
          </p>
          <MarqueeRow logos={ACCOUNTING} speedClass="animate-marquee" />
        </div>

        <div>
          <p className="text-[10px] font-mono text-gray-500 uppercase tracking-[0.2em] mb-3 text-center">
            Banks
          </p>
          <MarqueeRow logos={BANKS} speedClass="animate-marquee-fast" />
        </div>

        <div>
          <p className="text-[10px] font-mono text-gray-500 uppercase tracking-[0.2em] mb-3 text-center">
            Tax authority
          </p>
          <div className="flex justify-center">
            <LogoTile logo={AUTHORITY[0]} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Integrations;
