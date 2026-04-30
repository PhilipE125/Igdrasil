"use client";

import { useEffect, useState } from "react";
import { ArrowRight, FileText, Landmark, Sparkles } from "lucide-react";

type Match = {
  bank: string;
  vendor: string;
  ref: string;
  amount: string;
  fuzzy?: boolean;
};

const MATCHES: Match[] = [
  {
    bank: "MARMAR*ADS456789",
    vendor: "Marmar Annonser AB",
    ref: "FAK-2024-001",
    amount: "499.00 SEK",
    fuzzy: true,
  },
  {
    bank: "MOLNVERK*K2H7",
    vendor: "Molnverk Sverige AB",
    ref: "FAK-2024-002",
    amount: "89.45 SEK",
    fuzzy: true,
  },
  {
    bank: "SKOGEN PAY 4D",
    vendor: "Skogen Pay AB",
    ref: "FAK-2024-003",
    amount: "1,240.00 SEK",
  },
  {
    bank: "GRANIT*ANNUAL",
    vendor: "Granit Domäner AB",
    ref: "FAK-2024-004",
    amount: "99.00 SEK",
    fuzzy: true,
  },
  {
    bank: "KONSTV*MTHLY 65A",
    vendor: "Konstverk Studio AB",
    ref: "FAK-2024-005",
    amount: "52.99 SEK",
  },
];

const STEP_DURATION = 700;
const HOLD_DURATION = 3500;

export function BankMatchCard({ active = true }: { active?: boolean }) {
  const [matched, setMatched] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = () => setReducedMotion(mq.matches);
    handler();
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    if (reducedMotion) {
      setMatched(MATCHES.length);
      return;
    }
    if (!active) return;
    const isHolding = matched >= MATCHES.length;
    const id = window.setTimeout(
      () => setMatched((m) => (m >= MATCHES.length ? 0 : m + 1)),
      isHolding ? HOLD_DURATION : STEP_DURATION,
    );
    return () => window.clearTimeout(id);
  }, [matched, reducedMotion, active]);

  return (
    <div className="relative">
      <div className="relative rounded-2xl overflow-hidden border border-black/10 shadow-2xl bg-[#f4f3f1] flex flex-col h-[540px]">
        {/* Header */}
        <div className="flex items-center px-4 py-3 border-b border-black/5 bg-[#f4f3f1]">
          <span className="text-[13px] font-medium text-gray-900">
            Reconcile
          </span>
          <div className="ml-auto flex items-center gap-1.5 text-[11px] text-gray-600">
            <Sparkles size={11} className="text-[#ee8fe0]" />
            <span>
              {matched === 0
                ? "Matching transactions…"
                : `${matched} of ${MATCHES.length} matched`}
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="bg-white px-4 py-4 flex-1 flex flex-col">
          <div className="grid grid-cols-[1fr_64px_1fr] gap-3 px-2 pb-2 mb-1 border-b border-black/5 text-[10px] font-mono uppercase tracking-[0.15em] text-gray-400">
            <span className="flex items-center gap-1.5">
              <Landmark size={10} />
              Bank Transaction
            </span>
            <span></span>
            <span className="flex items-center gap-1.5">
              <FileText size={10} />
              Invoice
            </span>
          </div>

          <div className="flex-1 flex flex-col justify-around">
            {MATCHES.map((m, i) => {
              const isMatched = i < matched;
              return (
                <div
                  key={m.bank}
                  className="grid grid-cols-[1fr_64px_1fr] gap-3 items-center px-2 py-2 rounded-md hover:bg-gray-50/60"
                >
                  <div className="min-w-0">
                    <div className="text-[12px] font-mono text-gray-700 truncate">
                      {m.bank}
                    </div>
                    <div className="text-[10.5px] text-gray-500 mt-0.5">
                      {m.amount}
                    </div>
                  </div>

                  <div className="flex items-center justify-center">
                    <div
                      className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full border transition-all duration-500 ${
                        isMatched
                          ? "opacity-100 scale-100 bg-[#ee8fe0]/15 border-[#ee8fe0]/50 text-gray-800"
                          : "opacity-0 scale-90 border-transparent"
                      }`}
                    >
                      <Sparkles size={9} className="text-[#ee8fe0]" />
                      <span className="text-[9px] font-mono uppercase tracking-[0.15em]">
                        AI
                      </span>
                      <ArrowRight size={9} className="text-[#ee8fe0]" />
                    </div>
                  </div>

                  <div
                    className={`min-w-0 transition-all duration-500 ${
                      isMatched
                        ? "opacity-100 translate-x-0"
                        : "opacity-30 -translate-x-1"
                    }`}
                  >
                    <div className="text-[12px] text-gray-900 truncate">
                      {m.vendor}
                    </div>
                    <div className="text-[10.5px] text-gray-500 mt-0.5 flex items-center gap-1.5">
                      <span>{m.ref}</span>
                      {m.fuzzy && isMatched && (
                        <span className="px-1 py-0 rounded text-[8.5px] uppercase tracking-[0.12em] bg-orange-50 border border-orange-200 text-orange-700">
                          Fuzzy
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Caption */}
      <div className="mt-5 px-1">
        <h3 className="text-lg font-bold text-gray-900 tracking-tight">
          Reconciled
        </h3>
        <p className="text-sm text-gray-500 font-light mt-1 leading-relaxed">
          AI matches messy bank descriptions to the right invoice — even when
          the names don&apos;t quite line up.
        </p>
      </div>
    </div>
  );
}
