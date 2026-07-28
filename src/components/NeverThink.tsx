"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Inbox,
  Sparkles,
  TrendingUp,
} from "lucide-react";

const CYCLE_MS = 3500;
const SCENE_COUNT = 5;

const PINK = "#ee8fe0";

export function AccountingPipelineDemo() {
  const [scene, setScene] = useState(0);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (reduced) return;
    const id = window.setInterval(
      () => setScene((s) => (s + 1) % SCENE_COUNT),
      CYCLE_MS,
    );
    return () => window.clearInterval(id);
  }, [reduced]);

  return (
    <div
      className="relative rounded-2xl"
      style={{
        background:
          "radial-gradient(ellipse at 50% 50%, rgba(238,143,224,0.08), transparent 70%)",
      }}
    >
      <div className="px-2 sm:px-4 py-3 lg:py-4">
        <div className="relative h-[320px] sm:h-[360px] lg:h-[400px]">
          <AnimatePresence mode="popLayout">
            {scene === 0 && <SceneReceiving key="0" reduced={reduced} />}
            {scene === 1 && <SceneReading key="1" reduced={reduced} />}
            {scene === 2 && <SceneMatching key="2" reduced={reduced} />}
            {scene === 3 && <ScenePosting key="3" />}
            {scene === 4 && <SceneReport key="4" />}
          </AnimatePresence>
        </div>
      </div>

      <div className="flex items-center justify-center gap-1.5 pb-2">
        {Array.from({ length: SCENE_COUNT }).map((_, i) => (
          <span
            key={i}
            className={`h-1 rounded-full transition-all duration-500 ${
              i === scene
                ? "w-6 bg-[#ee8fe0]"
                : "w-1.5 bg-foreground/15"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────── shared ─────────────────────────── */

function SceneShell({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.985, filter: "blur(6px)" }}
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, scale: 1.01, filter: "blur(6px)" }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="absolute inset-0"
    >
      {children}
    </motion.div>
  );
}

function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl bg-white border border-black/10 shadow-[0_24px_60px_-24px_rgba(0,0,0,0.18)] ${className}`}
    >
      {children}
    </div>
  );
}

function Logo({ letter, hue }: { letter: string; hue: string }) {
  return (
    <div
      className="h-10 w-10 rounded-lg flex items-center justify-center text-white text-[13px] font-bold shrink-0"
      style={{ background: hue }}
    >
      {letter}
    </div>
  );
}

/* ───────────────── Scene 0: Receiving ───────────────── */

function SceneReceiving({ reduced }: { reduced: boolean }) {
  const items = [
    { letter: "K", hue: "#87CEFA", label: "Faktura · Konstverk", amount: "599 kr", x: "2%", delay: 0 },
    { letter: "F", hue: "#0acf83", label: "Mejl · Frejmark", amount: "495 kr", x: "26%", delay: 0.2 },
    { letter: "S", hue: "#635bff", label: "Kort · Skogen Pay", amount: "319 kr", x: "50%", delay: 0.4 },
    { letter: "U", hue: "#000000", label: "Kvitto · Utskär", amount: "249 kr", x: "74%", delay: 0.6 },
  ];

  return (
    <SceneShell>
      <div className="absolute inset-0">
        <div className="relative h-full">
          {items.map((it, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0, opacity: 0, rotate: -30, y: 90 }}
              animate={
                reduced
                  ? { scale: 1, opacity: 1, rotate: i % 2 ? 4 : -4, y: 90 }
                  : {
                      scale: [0, 1.08, 1],
                      opacity: [0, 1, 1],
                      rotate: [-30, i % 2 ? 8 : -8, i % 2 ? 4 : -4],
                      y: 90,
                    }
              }
              transition={{
                duration: 0.9,
                delay: it.delay,
                ease: [0.34, 1.56, 0.64, 1],
              }}
              style={{ left: it.x, top: 0 }}
              className="absolute"
            >
              <div className="flex items-center gap-3 rounded-xl bg-white border border-black/10 shadow-[0_12px_28px_-14px_rgba(0,0,0,0.25)] px-3.5 py-3 min-w-[200px]">
                <Logo letter={it.letter} hue={it.hue} />
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] text-gray-500 truncate">{it.label}</div>
                  <div className="text-sm font-medium text-gray-900">{it.amount}</div>
                </div>
              </div>
            </motion.div>
          ))}

          <div className="absolute left-0 right-0 bottom-2 mx-auto max-w-md px-2">
            <Card className="px-5 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-lg bg-gray-900 text-white flex items-center justify-center">
                    <Inbox className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-[11px] uppercase tracking-wide text-gray-500">
                      Igdrasil inbox
                    </div>
                    <div className="text-sm font-display text-gray-900">
                      4 new documents
                    </div>
                  </div>
                </div>
                <motion.div
                  animate={reduced ? {} : { scale: [1, 1.15, 1] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                  className="flex items-center gap-1.5 text-[11px] text-gray-900"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-[#ee8fe0]" />
                  Receiving
                </motion.div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </SceneShell>
  );
}

/* ───────────────── Scene 1: Reading ───────────────── */

function SceneReading({ reduced }: { reduced: boolean }) {
  const fields = [
    { label: "Leverantör", value: "Konstverk Studio AB", delay: 0.5 },
    { label: "Totalt", value: "599 kr", delay: 0.8 },
    { label: "Moms", value: "120 kr", delay: 1.1 },
    { label: "Konto", value: "6540 IT-tjänster", delay: 1.4 },
  ];
  return (
    <SceneShell>
      <div className="absolute inset-0 grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-center">
        <div className="relative mx-auto w-full max-w-sm">
          <Card className="p-5 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="text-[10px] uppercase tracking-wider text-gray-500">
                Faktura
              </div>
              <Logo letter="K" hue="#87CEFA" />
            </div>
            <div className="mt-2 text-lg font-display text-gray-900">
              Konstverk Studio AB
            </div>
            <div className="mt-4 space-y-2 text-xs text-gray-700 font-mono">
              <Line label="Pro Suite" value="359 kr" />
              <Line label="PDF Pro" value="165 kr" />
              <Line label="Asset credits" value="75 kr" />
              <div className="border-t border-black/10 pt-2">
                <Line label="Moms 25%" value="120 kr" />
              </div>
              <div className="flex justify-between text-gray-900 font-semibold">
                <span>Totalt</span>
                <span>599 kr</span>
              </div>
            </div>
            {!reduced && (
              <motion.div
                initial={{ y: 0 }}
                animate={{ y: ["0%", "100%", "0%"] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute left-0 right-0 top-0 h-[2px]"
                style={{
                  background:
                    "linear-gradient(to right, transparent, #ee8fe0, transparent)",
                  boxShadow: `0 0 20px ${PINK}`,
                }}
              />
            )}
          </Card>
        </div>

        <div className="w-full max-w-md mx-auto">
          <div className="flex items-center gap-2 mb-4 text-xs text-gray-500">
            <Sparkles className="h-3.5 w-3.5 text-[#ee8fe0]" />
            AI extraction
          </div>
          <div className="space-y-2">
            {fields.map((f) => (
              <motion.div
                key={f.label}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: f.delay }}
                className="flex items-center justify-between rounded-lg bg-white border border-black/10 px-3 py-2"
              >
                <span className="text-[11px] uppercase tracking-wider text-gray-500">
                  {f.label}
                </span>
                <span className="text-sm font-mono text-gray-900">{f.value}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </SceneShell>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

/* ───────────────── Scene 2: Matching ───────────────── */

function SceneMatching({ reduced }: { reduced: boolean }) {
  const rows = [
    { date: "04-11", name: "Skogen Pay utbetalning", amount: "+128 400,00", match: false, letter: "S", hue: "#635bff" },
    { date: "04-12", name: "Konstverk Studio AB", amount: "−599,00", match: true, letter: "K", hue: "#87CEFA" },
    { date: "04-12", name: "Frejmark Design AB", amount: "−495,00", match: false, letter: "F", hue: "#0acf83" },
  ];

  return (
    <SceneShell>
      <div className="absolute inset-0 grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-4 lg:gap-6 items-center">
        <div className="lg:justify-self-end w-full max-w-xs">
          <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-2">
            Document
          </div>
          <Card className="px-4 py-3">
            <div className="flex items-center gap-3">
              <Logo letter="K" hue="#87CEFA" />
              <div className="flex-1">
                <div className="text-sm text-gray-900">Konstverk Studio AB</div>
                <div className="text-[11px] text-gray-500">2026-04-12</div>
              </div>
              <div className="text-sm font-mono text-gray-900">599 kr</div>
            </div>
          </Card>
        </div>

        <div className="hidden lg:flex flex-col items-center gap-2">
          <svg width="120" height="40" viewBox="0 0 120 40">
            <motion.path
              d="M 0 20 C 40 20, 80 20, 120 20"
              fill="none"
              stroke={PINK}
              strokeWidth="1.5"
              strokeDasharray="4 4"
              initial={{ pathLength: 0 }}
              animate={reduced ? { pathLength: 1 } : { pathLength: [0, 1] }}
              transition={{ duration: 1.2, ease: "easeInOut" }}
            />
          </svg>
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.4, type: "spring" }}
            className="flex items-center gap-1.5 rounded-full bg-[#ee8fe0] text-white px-2.5 py-1 text-[10px] uppercase tracking-wider"
          >
            <CheckCircle2 className="h-3 w-3" />
            Matched
          </motion.div>
        </div>

        <div className="lg:justify-self-start w-full max-w-sm">
          <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-2">
            Bank transactions
          </div>
          <Card>
            {rows.map((r, i) => (
              <motion.div
                key={i}
                initial={{ backgroundColor: "rgba(255,255,255,0)" }}
                animate={
                  r.match
                    ? {
                        backgroundColor: [
                          "rgba(255,255,255,0)",
                          "rgba(238,143,224,0.18)",
                          "rgba(238,143,224,0.10)",
                        ],
                      }
                    : {}
                }
                transition={{ duration: 1.6, delay: 1.0 }}
                className="flex items-center gap-3 px-3 py-2.5 border-b border-black/5 last:border-b-0"
              >
                <div className="text-[10px] font-mono text-gray-500 w-10 shrink-0">
                  {r.date}
                </div>
                <div className="h-7 w-7 rounded-md flex items-center justify-center text-white text-[10px] font-bold shrink-0"
                  style={{ background: r.hue }}>
                  {r.letter}
                </div>
                <div className="flex-1 text-[12.5px] text-gray-900 truncate">
                  {r.name}
                </div>
                <div className="text-[12px] font-mono text-gray-900 whitespace-nowrap">
                  {r.amount}
                </div>
              </motion.div>
            ))}
          </Card>
        </div>
      </div>
    </SceneShell>
  );
}

/* ───────────────── Scene 3: Posting ───────────────── */

function ScenePosting() {
  const rows = [
    { acc: "6540", label: "IT-tjänster", debit: "479,00", credit: "" },
    { acc: "2641", label: "Ingående moms", debit: "120,00", credit: "" },
    { acc: "1930", label: "Företagskonto", debit: "", credit: "599,00" },
  ];

  return (
    <SceneShell>
      <div className="absolute inset-0 grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-6 lg:gap-8 items-center">
        <div className="w-full max-w-lg mx-auto lg:mx-0 lg:ml-auto">
          <div className="flex items-center justify-between mb-3">
            <div className="text-[10px] uppercase tracking-wider text-gray-500">
              Proposed verifikation
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-gray-700">
              <Sparkles className="h-3 w-3 text-[#ee8fe0]" />
              AI suggestion
            </div>
          </div>
          <Card className="overflow-hidden">
            <div className="grid grid-cols-[60px_1fr_90px_90px] px-4 py-2 border-b border-black/[0.06] text-[10px] uppercase tracking-wider text-gray-500">
              <span>Acct</span>
              <span>Text</span>
              <span className="text-right">Debit</span>
              <span className="text-right">Credit</span>
            </div>
            {rows.map((r, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 + i * 0.15 }}
                className="grid grid-cols-[60px_1fr_90px_90px] px-4 py-3 text-xs border-b border-black/[0.04] last:border-b-0"
              >
                <span className="font-mono text-gray-500">{r.acc}</span>
                <span className="text-gray-800">{r.label}</span>
                <span className="text-right font-mono tabular-nums text-gray-900">
                  {r.debit}
                </span>
                <span className="text-right font-mono tabular-nums text-gray-900">
                  {r.credit}
                </span>
              </motion.div>
            ))}
          </Card>
        </div>

        <div className="w-full max-w-xs mx-auto lg:mx-0">
          <Card className="p-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-[#ee8fe0]/30 flex items-center justify-center text-[14px] font-semibold text-gray-700 shrink-0">
                L
              </div>
              <div>
                <div className="text-[13px] font-medium text-gray-900">
                  Linnea Holm
                </div>
                <div className="text-[10px] text-gray-500">
                  Authorised accountant · Igdrasil
                </div>
              </div>
            </div>
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.4 }}
              className="mt-4 rounded-xl bg-gray-50 px-3 py-2.5 text-[12px] text-gray-700 leading-relaxed"
            >
              Verifikation balances. Moms 25% routed to 2641 — posting to your ledger.
            </motion.div>
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 1.5, duration: 0.4, type: "spring" }}
              className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#ee8fe0] text-white px-2.5 py-1 text-[10px] uppercase tracking-wider"
            >
              <CheckCircle2 className="h-3 w-3" />
              Posted to Fortnox
            </motion.div>
          </Card>
        </div>
      </div>
    </SceneShell>
  );
}

/* ───────────────── Scene 4: Closed report ───────────────── */

function SceneReport() {
  const messages = [
    {
      from: "Linnea",
      text: "Hi Anna! April books are closed and filed with Skatteverket. Moms reconciled, AGI submitted — all on time.",
      delay: 0.3,
    },
    {
      from: "Linnea",
      text: "Gross margin up 4 pp this month. Want me to walk through the Q2 outlook tomorrow at 10?",
      delay: 1.2,
    },
  ];

  return (
    <SceneShell>
      <div className="absolute inset-0 grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-center">
        <div className="w-full max-w-md mx-auto lg:ml-auto">
          <div className="flex items-center justify-between mb-3">
            <div className="text-[10px] uppercase tracking-wider text-gray-500">
              April 2026 · Closed
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-gray-700">
              <TrendingUp className="h-3 w-3 text-[#ee8fe0]" />
              Report ready
            </div>
          </div>
          <SqlReportPanel />
        </div>

        <div className="w-full max-w-sm mx-auto lg:mx-0 space-y-2.5">
          <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-2">
            Advisory · Linnea
          </div>
          {messages.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: m.delay }}
              className="flex items-start gap-2"
            >
              <div className="h-7 w-7 shrink-0 rounded-full bg-white border border-black/10 overflow-hidden grid place-items-center shadow-sm">
                <Image
                  src="/owl.png"
                  alt="Linnea"
                  width={28}
                  height={28}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex-1 rounded-2xl rounded-tl-md bg-white border border-black/10 px-3.5 py-2.5 text-[12.5px] text-gray-800 leading-relaxed shadow-sm">
                {m.text}
              </div>
            </motion.div>
          ))}
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 1.8 }}
            className="flex items-center gap-2 text-[11px] text-gray-700 pt-1"
          >
            <ArrowRight className="h-3 w-3 text-[#ee8fe0]" />
            Tomorrow · 10:00 — Q2 walkthrough
          </motion.div>
        </div>
      </div>
    </SceneShell>
  );
}

/* ───────────────── SQL report panel ───────────────── */

function SqlReportPanel() {
  const data = [80, 100, 60, 90, 200, 1200, 1400, 1100, 1700, 800, 600, 400, 7500];
  const labels = [
    "10-19", "10-24", "10-27", "10-30", "10-31", "11-13", "11-21",
    "11-25", "11-30", "12-03", "12-06", "12-08", "12-31",
  ];
  const maxY = 8000;
  const W = 320;
  const H = 110;
  const padX = 22;
  const padY = 10;

  const points = data.map((v, i) => ({
    x: padX + ((W - padX * 2) * i) / (data.length - 1),
    y: H - padY - ((H - padY * 2) * v) / maxY,
  }));
  const linePath = makeSmoothPath(points);
  const baseY = H - padY;
  const last = points[points.length - 1];
  const areaPath = `${linePath} L ${last.x.toFixed(2)} ${baseY} L ${points[0].x.toFixed(2)} ${baseY} Z`;

  return (
    <Card className="overflow-hidden">
      {/* SQL header bar */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-black/[0.06] bg-white">
        <div className="text-[10px] font-mono text-gray-500 uppercase tracking-[0.15em]">SQL</div>
        <div className="flex items-center gap-1">
          <div className="h-3.5 w-3.5 rounded-[3px] bg-gray-100" />
          <div className="h-3.5 w-3.5 rounded-[3px] bg-gray-100" />
          <div className="h-3.5 w-3.5 rounded-full bg-[#ee8fe0]/20 grid place-items-center">
            <span className="size-1.5 rounded-full bg-[#ee8fe0]" />
          </div>
        </div>
      </div>

      {/* SQL code */}
      <div className="px-3 py-2 font-mono text-[9px] leading-relaxed bg-white text-gray-700 overflow-hidden">
        <SqlLine delay={0.1}>
          <span className="text-blue-600">SELECT</span> e.entry_date,{" "}
          <span className="text-blue-600">SUM</span>(l.debit_amount){" "}
          <span className="text-blue-600">AS</span> daily_expenses
        </SqlLine>
        <SqlLine delay={0.2}>
          <span className="text-blue-600">FROM</span> ledger_entry_lines{" "}
          <span className="text-blue-600">AS</span> l
        </SqlLine>
        <SqlLine delay={0.3}>
          <span className="text-blue-600">JOIN</span> ledger_entries{" "}
          <span className="text-blue-600">AS</span> e
        </SqlLine>
        <SqlLine delay={0.4}>
          <span className="text-blue-600">WHERE</span> e.status ={" "}
          <span className="text-orange-600">&apos;posted&apos;</span>
        </SqlLine>
      </div>

      {/* Owl assistant input */}
      <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50/70 border-t border-black/[0.06]">
        <div className="size-5 shrink-0 rounded-full bg-white border border-black/10 overflow-hidden grid place-items-center">
          <Image src="/owl.png" alt="" width={20} height={20} className="h-full w-full object-cover" />
        </div>
        <span className="text-[10px] text-gray-500 italic truncate">
          Edit this report in plain English…
        </span>
        <div className="ml-auto h-5 w-5 rounded-full bg-[#ee8fe0]/15 grid place-items-center shrink-0">
          <ArrowRight className="h-2.5 w-2.5 text-[#ee8fe0]" />
        </div>
      </div>

      {/* Chart title */}
      <div className="px-3 pt-2 pb-0.5 border-t border-black/[0.06]">
        <div className="text-[9px] uppercase tracking-wider text-gray-500">
          Daily expenses · sum
        </div>
        <div className="text-base font-display text-gray-900 tracking-tight">
          14 771 kr
        </div>
      </div>

      {/* Chart */}
      <div className="px-1 pb-2">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-[110px]" aria-hidden>
          <defs>
            <linearGradient id="sql-fill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#ee8fe0" stopOpacity="0.32" />
              <stop offset="100%" stopColor="#ee8fe0" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Y axis grid */}
          {[0, 0.25, 0.5, 0.75, 1].map((p) => (
            <line
              key={p}
              x1={padX}
              y1={padY + (H - padY * 2) * p}
              x2={W - padX}
              y2={padY + (H - padY * 2) * p}
              stroke="#e5e7eb"
              strokeDasharray="2 3"
              strokeWidth="0.7"
            />
          ))}

          {/* Y axis labels */}
          {[0, 2, 4, 6, 8].map((v, i) => (
            <motion.text
              key={v}
              x={padX - 3}
              y={baseY - ((H - padY * 2) * v) / 8 + 2.5}
              textAnchor="end"
              fontSize="6"
              fill="#9ca3af"
              fontFamily="ui-monospace,SFMono-Regular,monospace"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 + i * 0.04, duration: 0.3 }}
            >
              {v === 0 ? "0" : `${v}.0k`}
            </motion.text>
          ))}

          {/* Area fill */}
          <motion.path
            d={areaPath}
            fill="url(#sql-fill)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.0, duration: 0.6 }}
          />

          {/* Line */}
          <motion.path
            d={linePath}
            fill="none"
            stroke="#ee8fe0"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: 0.5, duration: 1.6, ease: "easeInOut" }}
          />

          {/* End dot */}
          <motion.circle
            cx={last.x}
            cy={last.y}
            r="2.5"
            fill="#ee8fe0"
            stroke="white"
            strokeWidth="1.2"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 2.0, duration: 0.3, type: "spring" }}
            style={{ transformOrigin: `${last.x}px ${last.y}px` }}
          />
        </svg>

        {/* X axis labels */}
        <div className="flex justify-between px-3 pt-0.5 text-[7px] font-mono text-gray-400 tabular-nums">
          <span>{labels[0]}</span>
          <span>{labels[Math.floor(labels.length / 2)]}</span>
          <span>{labels[labels.length - 1]}</span>
        </div>
      </div>
    </Card>
  );
}

function SqlLine({ children, delay }: { children: React.ReactNode; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -4 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.3 }}
      className="whitespace-nowrap overflow-hidden text-ellipsis"
    >
      {children}
    </motion.div>
  );
}

function makeSmoothPath(points: { x: number; y: number }[]) {
  if (points.length < 2) return "";
  let d = `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i];
    const p1 = points[i + 1];
    const cpx1 = p0.x + (p1.x - p0.x) / 3;
    const cpy1 = p0.y;
    const cpx2 = p1.x - (p1.x - p0.x) / 3;
    const cpy2 = p1.y;
    d += ` C ${cpx1.toFixed(2)} ${cpy1.toFixed(2)}, ${cpx2.toFixed(2)} ${cpy2.toFixed(2)}, ${p1.x.toFixed(2)} ${p1.y.toFixed(2)}`;
  }
  return d;
}
