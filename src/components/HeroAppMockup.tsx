"use client";

import { useState } from "react";
import { MoonIcon, SunIcon } from "@/components/icons";
import {
  heroDockButtons,
  heroMockupContent,
  type HeroDockTab,
} from "@/lib/content";
import { cn } from "@/lib/utils";

export function HeroAppMockup() {
  const [active, setActive] = useState<HeroDockTab>("Home");
  const c = heroMockupContent;

  return (
    <div className="relative z-10 pt-12 lg:pt-20">
      <div className="relative mx-auto max-w-7xl overflow-hidden px-4 pb-8 max-sm:pl-4 max-sm:pr-0 lg:px-10">
        <div
          role="region"
          aria-label="App preview"
          className="bg-layer-1 ring-1 ring-foreground/10 relative flex shadow-2xl shadow-black/25 max-sm:h-[75vh] max-sm:w-[140%] max-sm:rounded-l-2xl max-sm:rounded-r-none sm:aspect-[16/9] sm:min-h-[576px] sm:overflow-hidden sm:rounded-2xl"
        >
          {/* Sidebar */}
          <div className="flex w-[200px] flex-shrink-0 flex-col overflow-hidden px-2 pb-2 pt-3 lg:w-[220px] border-r border-foreground/10">
            <div className="mb-3 flex items-center gap-1.5 px-2">
              <div className="flex size-4 items-center justify-center rounded bg-blue-main text-[8px] font-bold text-white">
                {c.workspaceName.slice(0, 1)}
              </div>
              <span className="text-sm font-semibold text-foreground">{c.workspaceName}</span>
            </div>
            <nav className="flex flex-col gap-0.5">
              {heroDockButtons.map((label) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => setActive(label)}
                  aria-pressed={active === label}
                  className={cn(
                    "h-8 px-3 text-left text-[13px] font-semibold rounded-md transition-colors",
                    active === label
                      ? "bg-white/[0.06] text-foreground"
                      : "text-muted-foreground hover:bg-white/[0.04] hover:text-foreground/85",
                  )}
                >
                  {label}
                </button>
              ))}
            </nav>
            <div className="mt-auto px-1 pt-3">
              <button
                aria-label="Toggle theme"
                type="button"
                className="size-7 inline-flex items-center justify-center rounded-md text-muted-foreground hover:bg-white/[0.04] hover:text-foreground/85 transition-colors"
              >
                <SunIcon className="size-4 dark:hidden" />
                <MoonIcon className="hidden dark:block size-4" />
              </button>
            </div>
          </div>

          {/* Right pane */}
          <div className="flex-1 flex flex-col">
            <PaneHeader active={active} hint={c.paneActionHint} />
            <div className="flex-1 overflow-hidden">
              {active === "Home" && <HomePanel />}
              {active === "AI Chat" && <AiChatPanel />}
              {active === "Email" && <EmailPanel />}
              {active === "Document" && <DocumentPanel />}
              {active === "Task" && <TaskPanel />}
              {active === "Company" && <CompanyPanel />}
              {active === "Person" && <PersonPanel />}
              {active === "Event" && <EventPanel />}
              {active === "CRM" && <CRMPanel />}
              {active === "Eng" && <EngPanel />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PaneHeader({ active, hint }: { active: HeroDockTab; hint: string }) {
  return (
    <div className="h-10 border-b border-foreground/10 flex items-center px-4 gap-2 bg-layer-2/40 shrink-0">
      <div className="size-2 rounded-full bg-foreground/20" />
      <div className="text-xs font-semibold text-muted-foreground">{active}</div>
      <div className="ml-auto text-[11px] text-muted-foreground/60">{hint}</div>
    </div>
  );
}

/* ─── Panels ──────────────────────────────────────────────────────── */

function HomePanel() {
  return (
    <div className="grid grid-cols-2 gap-4 p-6 h-full overflow-y-auto">
      {heroMockupContent.home.cards.map((card) => (
        <Card key={card.title} title={card.title} subtitle={card.subtitle}>
          <ul className="space-y-1.5 text-[12px] text-foreground/85">
            {card.items.map((item) => (
              <li key={item}>• {item.replace(/^[•·] ?/, "")}</li>
            ))}
          </ul>
        </Card>
      ))}
    </div>
  );
}

function AiChatPanel() {
  const { messages, composerPlaceholder, composerHotkey } = heroMockupContent.aiChat;
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((m, i) => (
          <Bubble key={i} who={m.who}>
            {m.text}
            {"bullets" in m && m.bullets ? (
              <ul className="mt-2 space-y-1 text-[12px] text-foreground/85">
                {m.bullets.map((b) => (
                  <li key={b}>• {b}</li>
                ))}
              </ul>
            ) : null}
          </Bubble>
        ))}
      </div>
      <div className="border-t border-foreground/10 p-3 shrink-0">
        <div className="h-9 rounded-[6px] bg-layer-3 border border-input flex items-center px-3 text-[12px] text-muted-foreground">
          {composerPlaceholder}
          <span className="ml-auto text-[10px] uppercase tracking-wider">{composerHotkey}</span>
        </div>
      </div>
    </div>
  );
}

function Bubble({ who, children }: { who: "user" | "ai"; children: React.ReactNode }) {
  return (
    <div className={cn("flex", who === "user" ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[80%] rounded-[8px] px-3 py-2 text-[12.5px] leading-relaxed",
          who === "user"
            ? "bg-blue-main/20 text-foreground"
            : "bg-layer-3 text-foreground/90 border border-foreground/5",
        )}
      >
        {children}
      </div>
    </div>
  );
}

function EmailPanel() {
  const { threads, bodyParagraphs, bodyBullets, signoff } = heroMockupContent.email;
  const [selected, setSelected] = useState(0);
  const t = threads[selected];

  return (
    <div className="flex h-full">
      <div className="w-[300px] border-r border-foreground/10 flex flex-col overflow-y-auto">
        {threads.map((tr, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setSelected(i)}
            className={cn(
              "px-4 py-3 border-b border-foreground/5 flex flex-col gap-1 text-left transition-colors",
              selected === i ? "bg-white/[0.06]" : "hover:bg-white/[0.03]",
            )}
          >
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-[13px] font-semibold text-foreground truncate">
                {tr.from}
              </span>
              <span className="text-[11px] text-muted-foreground/70">{tr.time}</span>
            </div>
            <div className="text-[12px] font-medium text-foreground/85 truncate">
              {tr.subject}
            </div>
            <div className="text-[12px] text-muted-foreground/70 truncate">
              {tr.preview}
            </div>
          </button>
        ))}
      </div>
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="px-6 py-4 border-b border-foreground/10 flex items-center gap-3 shrink-0">
          <div className="size-7 rounded-full bg-blue-main/30 flex items-center justify-center text-[11px] font-semibold text-foreground">
            {t.from.slice(0, 1)}
          </div>
          <div className="flex flex-col">
            <span className="text-[13px] font-semibold text-foreground">{t.subject}</span>
            <span className="text-[11px] text-muted-foreground">
              {t.from.toLowerCase().replace(/\s+/g, "")}@acme.com · {t.time} ago
            </span>
          </div>
        </div>
        <div className="p-6 text-[13px] text-foreground/85 leading-6 space-y-3 overflow-y-auto">
          {bodyParagraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
          <ul className="list-disc pl-5 space-y-1">
            {bodyBullets.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
          <p>{signoff}<br />{t.from.split(" ")[0]}</p>
        </div>
      </div>
    </div>
  );
}

function DocumentPanel() {
  const { eyebrow, title, sections } = heroMockupContent.document;
  return (
    <div className="h-full overflow-y-auto px-12 py-10 max-w-3xl mx-auto">
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
        {eyebrow}
      </div>
      <h1 className="mt-3 text-2xl font-semibold text-foreground">{title}</h1>
      <div className="mt-6 space-y-4 text-[13px] text-foreground/85 leading-6">
        {sections.map((s, i) => {
          if (s.kind === "h2")
            return (
              <h2 key={i} className="text-base font-semibold text-foreground pt-2">
                {s.body}
              </h2>
            );
          if (s.kind === "p") return <p key={i}>{s.body}</p>;
          return (
            <ul key={i} className="list-disc pl-5 space-y-1.5">
              {s.items.map((it) => (
                <li key={it}>{it}</li>
              ))}
            </ul>
          );
        })}
      </div>
    </div>
  );
}

function TaskPanel() {
  return (
    <div className="grid grid-cols-3 gap-3 p-4 h-full overflow-hidden">
      {heroMockupContent.task.columns.map((c) => (
        <div
          key={c.title}
          className="bg-layer-2/40 rounded-[6px] border border-foreground/5 p-3 flex flex-col overflow-y-auto"
        >
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">
            {c.title}
          </div>
          <div className="flex flex-col gap-2">
            {c.tasks.map((t) => (
              <div
                key={t}
                className="bg-layer-3 rounded-[4px] border border-foreground/5 p-2.5 text-[12px] text-foreground/90"
              >
                {t}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function CompanyPanel() {
  const { list, detail } = heroMockupContent.company;
  return (
    <div className="grid grid-cols-[260px_1fr] h-full overflow-hidden">
      <div className="border-r border-foreground/10 overflow-y-auto p-3 flex flex-col gap-1">
        {list.map((n, i) => (
          <div
            key={n}
            className={cn(
              "px-3 py-2 rounded-[4px] text-[13px] text-foreground/85",
              i === 0 ? "bg-white/[0.06] text-foreground" : "hover:bg-white/[0.03]",
            )}
          >
            {n}
          </div>
        ))}
      </div>
      <div className="p-6 overflow-y-auto">
        <div className="flex items-center gap-3">
          <div className="size-12 rounded-[4px] bg-blue-main/30 grid place-items-center text-foreground font-bold">
            {detail.initials}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">{detail.name}</h2>
            <p className="text-xs text-muted-foreground">{detail.tagline}</p>
          </div>
        </div>
        <PropertyTable rows={detail.properties} />
      </div>
    </div>
  );
}

function PersonPanel() {
  const { list, detail } = heroMockupContent.person;
  return (
    <div className="grid grid-cols-[260px_1fr] h-full overflow-hidden">
      <div className="border-r border-foreground/10 overflow-y-auto p-3 flex flex-col gap-1">
        {list.map((n, i) => (
          <div
            key={n}
            className={cn(
              "px-3 py-2 rounded-[4px] text-[13px] text-foreground/85",
              i === 0 ? "bg-white/[0.06] text-foreground" : "hover:bg-white/[0.03]",
            )}
          >
            {n}
          </div>
        ))}
      </div>
      <div className="p-6 overflow-y-auto">
        <div className="flex items-center gap-3">
          <div className="size-12 rounded-full bg-violet-main/40 grid place-items-center text-foreground font-bold">
            {detail.initials}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">{detail.name}</h2>
            <p className="text-xs text-muted-foreground">{detail.tagline}</p>
          </div>
        </div>
        <PropertyTable rows={detail.properties} />
      </div>
    </div>
  );
}

function EventPanel() {
  const { weekdays, meetingDays, detail } = heroMockupContent.event;
  return (
    <div className="grid grid-cols-[1fr_300px] h-full overflow-hidden">
      <div className="overflow-y-auto p-4">
        <div className="grid grid-cols-7 gap-px bg-foreground/5 rounded-[4px] overflow-hidden text-[11px]">
          {weekdays.map((d) => (
            <div
              key={d}
              className="bg-layer-2 px-2 py-2 font-semibold text-muted-foreground text-center"
            >
              {d}
            </div>
          ))}
          {Array.from({ length: 7 * 4 }).map((_, i) => {
            const day = i + 1;
            const isMeeting = (meetingDays as readonly number[]).includes(day);
            return (
              <div key={i} className="bg-layer-1 h-20 p-1.5 relative">
                <span className="text-muted-foreground/60">{day}</span>
                {isMeeting && (
                  <div className="absolute left-1.5 right-1.5 bottom-1.5 h-4 rounded-sm bg-blue-main/40 text-[10px] px-1 grid place-items-center text-foreground truncate">
                    Meeting
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <div className="border-l border-foreground/10 p-5 overflow-y-auto">
        <h3 className="text-sm font-semibold text-foreground">{detail.title}</h3>
        <p className="text-xs text-muted-foreground mt-1">{detail.subtitle}</p>
        <PropertyTable rows={detail.properties} compact />
      </div>
    </div>
  );
}

function CRMPanel() {
  const { columns, rows } = heroMockupContent.crm;
  return (
    <div className="h-full overflow-y-auto p-4">
      <div className="bg-layer-2/40 rounded-[6px] border border-foreground/5 overflow-hidden">
        <div className="grid grid-cols-[1.4fr_1.2fr_1fr_0.8fr_0.8fr] gap-3 px-4 py-2.5 text-[11px] uppercase tracking-wider text-muted-foreground font-semibold border-b border-foreground/10 bg-layer-3/40">
          {columns.map((c) => (
            <div key={c}>{c}</div>
          ))}
        </div>
        {rows.map((r, i) => (
          <div
            key={i}
            className="grid grid-cols-[1.4fr_1.2fr_1fr_0.8fr_0.8fr] gap-3 px-4 py-3 text-[12.5px] text-foreground/90 border-b border-foreground/5 hover:bg-white/[0.03]"
          >
            {r.map((cell, j) => (
              <div key={j} className="truncate">{cell}</div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function EngPanel() {
  return (
    <div className="h-full overflow-y-auto p-4 space-y-3">
      {heroMockupContent.eng.issues.map((t) => (
        <div
          key={t.id}
          className="bg-layer-2/40 border border-foreground/5 rounded-[4px] px-4 py-3 flex items-center gap-4"
        >
          <span className="text-[11px] font-mono text-muted-foreground w-16">{t.id}</span>
          <span className="text-[13px] text-foreground/90 flex-1 truncate">{t.title}</span>
          <span className="text-[11px] text-muted-foreground w-28 truncate">{t.assignee}</span>
          <span
            className={cn(
              "text-[10px] uppercase tracking-wider font-semibold rounded-full px-2 py-0.5",
              t.status === "Done" && "bg-green-300/20 text-green-300",
              t.status === "In Progress" && "bg-blue-main/20 text-blue-main",
              t.status === "In Review" && "bg-violet-main/20 text-violet-main",
              t.status === "To do" && "bg-foreground/5 text-muted-foreground",
            )}
          >
            {t.status}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ─── Shared bits ─────────────────────────────────────────────────── */

function Card({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-layer-2/40 rounded-[6px] border border-foreground/5 p-4">
      <div className="flex items-baseline justify-between mb-2">
        <h3 className="text-[13px] font-semibold text-foreground">{title}</h3>
        <span className="text-[10px] text-muted-foreground/80">{subtitle}</span>
      </div>
      {children}
    </div>
  );
}

function PropertyTable({
  rows,
  compact = false,
}: {
  rows: [string, string][];
  compact?: boolean;
}) {
  return (
    <dl
      className={cn(
        "mt-6 grid gap-x-6 gap-y-3 text-[12.5px]",
        compact ? "grid-cols-1 mt-5 gap-y-1.5" : "grid-cols-2",
      )}
    >
      {rows.map(([k, v]) => (
        <div
          key={k}
          className={cn(
            "flex justify-between border-b border-foreground/5",
            compact ? "pb-1.5 text-[12px]" : "pb-2",
          )}
        >
          <dt className="text-muted-foreground">{k}</dt>
          <dd className="text-foreground/90 truncate ml-3">{v}</dd>
        </div>
      ))}
    </dl>
  );
}
