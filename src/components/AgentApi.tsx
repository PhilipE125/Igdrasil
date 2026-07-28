"use client";

import Image from "next/image";
import { agentLogos, siteCopy } from "@/lib/content";
import { cn } from "@/lib/utils";

export function AgentApi() {
  const c = siteCopy.agentApi;
  return (
    <section className="bg-background py-16 md:py-20">
      <div className="mx-auto w-full max-w-6xl px-6 lg:px-12">
        <div className="grid items-center gap-12 lg:grid-cols-[1fr_1.15fr] lg:gap-16">
          {/* Copy */}
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground font-semibold">
              {c.eyebrow}
            </p>
            <h2 className="mt-3 font-display text-4xl md:text-5xl lg:text-6xl font-black tracking-[0.02em] text-foreground text-balance">
              {c.heading}
            </h2>
            <p className="mt-5 text-base md:text-lg text-muted-foreground text-pretty max-w-xl">
              {c.sub}
            </p>
            <ul className="mt-8 space-y-3 text-sm md:text-[15px] text-foreground/85">
              {c.bullets.map((b) => (
                <li key={b} className="flex gap-3">
                  <span className="text-foreground/45 select-none mt-[2px]">→</span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>

            <div className="mt-10">
              <p className="text-[11px] uppercase tracking-[0.15em] text-subtle-foreground font-semibold">
                {c.lovedByLabel}
              </p>
              <div className="mt-4 flex items-center gap-6">
                {agentLogos.map((l) => (
                  <Image
                    key={l.name}
                    src={l.src}
                    alt={l.name}
                    width={40}
                    height={40}
                    className="size-10 object-contain rounded-[6px]"
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Terminal */}
          <Terminal
            titleBar={c.terminal.titleBar}
            lines={c.terminal.lines}
          />
        </div>
      </div>
    </section>
  );
}

type TerminalLine = (typeof siteCopy.agentApi.terminal.lines)[number];

function Terminal({
  titleBar,
  lines,
}: {
  titleBar: string;
  lines: readonly TerminalLine[];
}) {
  return (
    <div className="rounded-2xl bg-[#0c0d10] ring-1 ring-white/10 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.5)] overflow-hidden">
      {/* Title bar */}
      <div className="flex items-center gap-2 px-4 h-9 border-b border-white/[0.08] bg-white/[0.03]">
        <span className="size-3 rounded-full bg-[#ff5f57]" />
        <span className="size-3 rounded-full bg-[#febc2e]" />
        <span className="size-3 rounded-full bg-[#28c840]" />
        <span className="ml-3 text-[11px] font-mono text-white/40 tracking-tight">
          {titleBar}
        </span>
      </div>

      {/* Body */}
      <div className="px-5 py-5 font-mono text-[12.5px] md:text-[13px] leading-[1.65] text-white/80 space-y-[2px]">
        {lines.map((line, i) => {
          if (line.kind === "prompt") {
            return (
              <div key={i} className="flex gap-2 pt-2 first:pt-0">
                <span className="text-[#7ee787] select-none">$</span>
                <span className="text-white">{line.text}</span>
              </div>
            );
          }
          if (line.kind === "ok") {
            return (
              <div key={i} className="flex gap-2 text-white/70">
                <span className="text-white/35 select-none">›</span>
                <span className="text-[#7ee787]">✔</span>
                <span>{line.text}</span>
              </div>
            );
          }
          if (line.kind === "child") {
            return (
              <div key={i} className="flex gap-2 text-white/55">
                <span className="text-white/30 select-none">›</span>
                <span className="text-white/30 select-none">↳</span>
                <span>{line.text}</span>
              </div>
            );
          }
          // typing — last line, with blinking cursor
          return (
            <div key={i} className="flex gap-2 pt-2">
              <span className="text-[#7ee787] select-none">$</span>
              <span className="text-white">
                {line.text}
                <span
                  aria-hidden="true"
                  className={cn(
                    "inline-block ml-[1px] w-[7px] h-[1.05em] -mb-[2px] bg-white/85 align-middle",
                    "animate-terminal-cursor",
                  )}
                />
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
