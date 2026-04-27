import React from 'react';
import { Plus } from 'lucide-react';

type Item = { q: string; a: React.ReactNode };

const ITEMS: Item[] = [
  {
    q: 'How is Igdrasil different from a traditional accounting firm?',
    a: "We're a small, driven team that works closely with every client. Beyond the usual bookkeeping and payroll, we automate and integrate our own workflows — so routine admin runs on autopilot and the time we spend with you goes into insights that actually help your business.",
  },
  {
    q: 'Can I keep using my existing accounting software?',
    a: 'Yes. We work directly with the platforms Swedish companies already rely on — Fortnox, Bokio, Visma, Björn Lundén, Briox — and connect with the major banks (Handelsbanken, Nordea, SEB, Swedbank, Lunar, Juni) and Skatteverket. No migration required.',
  },
  {
    q: 'How much does it cost?',
    a: "Pricing is tailored to your company's size, complexity, and the scope of services you need. Get in touch and we'll put together a quote — usually within a business day.",
  },
  {
    q: 'Is my financial data secure?',
    a: 'We follow strict professional confidentiality as required by Swedish law and are fully GDPR-compliant. You can review our Privacy Policy and data handling practices in the Legal section.',
  },
  {
    q: 'How do I get started?',
    a: 'Join the waitlist above, or reach out via the Contact page. We onboard new clients throughout the year and will walk you through setup once we have a clear picture of your stack.',
  },
  {
    q: 'Do you work with companies outside Sweden?',
    a: "We focus on companies registered and operating in Sweden — that's where our expertise in Bokföringslagen, Skatteverket, and Swedish payroll is strongest. If you have Swedish operations, we can likely help.",
  },
];

type FaqProps = {
  onContactClick: () => void;
};

const Faq: React.FC<FaqProps> = ({ onContactClick }) => {
  return (
    <section
      id="faq"
      aria-labelledby="faq-heading"
      className="max-w-3xl mx-auto text-left pt-12 pb-8 border-t border-black/5 scroll-mt-24"
    >
      <div className="mb-10">
        <p className="text-sm font-mono uppercase tracking-wider mb-4">
          <span className="text-igdrasil-accent font-medium">04</span>
          <span className="text-gray-400 mx-2">&mdash;</span>
          <span className="text-igdrasil-accent">FAQ</span>
        </p>
        <h2
          id="faq-heading"
          className="text-2xl font-light text-gray-900 tracking-tight"
        >
          Questions before you sign up
        </h2>
      </div>

      <div className="divide-y divide-black/10 border-y border-black/10">
        {ITEMS.map((item, i) => (
          <details
            key={i}
            className="group py-5 [&_svg]:transition-transform [&[open]_svg]:rotate-45"
          >
            <summary className="flex items-center justify-between gap-4 cursor-pointer list-none text-gray-900 text-base font-medium hover:text-igdrasil-accent transition-colors focus:outline-none focus-visible:outline focus-visible:outline-1 focus-visible:outline-igdrasil-accent rounded-sm [&::-webkit-details-marker]:hidden">
              <span>{item.q}</span>
              <Plus
                size={18}
                className="text-igdrasil-accent shrink-0"
                aria-hidden
              />
            </summary>
            <div className="pt-3 pr-8 text-gray-600 font-light leading-relaxed">
              {item.a}
            </div>
          </details>
        ))}
      </div>

      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500 font-light">
          Still have questions?{' '}
          <button
            type="button"
            onClick={onContactClick}
            className="text-gray-900 hover:text-igdrasil-accent underline decoration-black/20 underline-offset-4 transition-colors"
          >
            Get in touch
          </button>
          .
        </p>
      </div>
    </section>
  );
};

export default Faq;
