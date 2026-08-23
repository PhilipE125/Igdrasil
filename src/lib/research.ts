/**
 * Content and derived figures for /research.
 *
 * Every number below is placeholder data. The two live series are real
 * projects — Nyregistreringar runs against SCB in the Svala repo, and
 * Redovisningsjobb is being built here — but nothing on this page is wired to
 * a source yet. `output: "export"` means there is no server to fetch from at
 * runtime, so the shipped page will read a JSON snapshot written into the repo
 * by whatever publishes each series, and a rebuild is what makes it current.
 *
 * Deltas are computed from `points`, never stored, so the copy cannot drift
 * away from the chart.
 */

import type {
  ResearchArticle,
  ResearchPoint,
  ResearchSeries,
} from "@/types/content";

/** ISO week the data currently runs through. */
export const DATA_THROUGH = { year: 2026, week: 34 };
export const LAST_INGEST_LABEL = "2 h ago";

/**
 * Turns a run of weekly values into labelled points, counting forward from
 * `startYear`/`startWeek`. The final value is always the week in progress.
 */
function weekly(
  startYear: number,
  startWeek: number,
  values: number[],
): ResearchPoint[] {
  let year = startYear;
  let week = startWeek;
  return values.map((value, i) => {
    const point: ResearchPoint = {
      label: `w${week}`,
      year,
      value,
      partial: i === values.length - 1,
    };
    week += 1;
    if (week > 52) {
      week = 1;
      year += 1;
    }
    return point;
  });
}

export const researchSeries: ResearchSeries[] = [
  {
    id: "nyregistreringar",
    title: "Nyregistreringar",
    question:
      "How many new companies are registered in Sweden each week — and in which industries?",
    what: "New company registrations by SNI industry, legal form and county",
    source: "SCB Företagsdatabasen",
    cadence: "Weekly · mon 06:00",
    status: "live",
    href: "#nyregistreringar",
    updatedLabel: "2 h ago",
    chart: "column",
    metric: {
      unit: "new AB",
      shortUnit: "/ week",
      points: weekly(2025, 34, [
        1290, 1290, 1345, 1310, 1288, 1352, 1298, 1330, 1276, 1312, 1180, 1295,
        1320, 1288, 1244, 1210, 1105, 742, 588, 1420, 1512, 1466, 1398, 1352,
        1310, 1268, 1334, 1298, 1352, 1310, 1288, 1195, 1042, 1268, 1322, 1290,
        1188, 1246, 1302, 1275, 1188, 1220, 1264, 1198, 1102, 868, 712, 690,
        754, 962, 1188, 1275, 1342,
        // week in progress
        486,
      ]),
    },
    breakdown: {
      kind: "ranked",
      caption: "Top industries · week 34",
      valueCaption: "Change vs 4-wk avg",
      rows: [
        { name: "Dataprogrammering & datakonsult", sub: "SNI 62", value: 214, deltaPct: 12 },
        { name: "Konsultverksamhet, huvudkontor", sub: "SNI 70", value: 186, deltaPct: 9 },
        { name: "Fastighetsverksamhet", sub: "SNI 68", value: 141, deltaPct: -3 },
        { name: "Specialiserad byggverksamhet", sub: "SNI 43", value: 118, deltaPct: 6 },
        { name: "Detaljhandel", sub: "SNI 47", value: 97, deltaPct: -9 },
        { name: "Juridik, ekonomi & redovisning", sub: "SNI 69", value: 74, deltaPct: 15 },
        { name: "Andra konsumenttjänster", sub: "SNI 96", value: 68, deltaPct: 4 },
        { name: "Hälso- och sjukvård", sub: "SNI 86", value: 61, deltaPct: -5 },
        { name: "Restaurang & catering", sub: "SNI 56", value: 52, deltaPct: -8 },
        { name: "Handel med motorfordon", sub: "SNI 45", value: 44, deltaPct: 2 },
      ],
      footnote: "+ 287 registrations across 58 other SNI divisions",
    },
    read:
      "The July trough is over. Week 34 is back above the pre-summer level, and consulting and IT services carry almost all of the recovery. Retail has not come back — it is still running below where it sat in May.",
  },
  {
    id: "redovisningsjobb",
    title: "Redovisningsjobb",
    question:
      "How many accounting roles are open in Sweden right now — bureau or in-house?",
    what: "Open accounting, payroll and audit roles — bureau vs in-house",
    source: "JobTech / Platsbanken",
    cadence: "Daily · 04:00",
    status: "building",
    href: "#redovisningsjobb",
    updatedLabel: "6 h ago",
    chart: "area",
    metric: {
      unit: "open roles",
      shortUnit: "open roles",
      points: weekly(2025, 34, [
        2454, 2455, 2492, 2470, 2438, 2410, 2452, 2405, 2380, 2362, 2398, 2340,
        2312, 2288, 2255, 2210, 2065, 1780, 1620, 2280, 2415, 2468, 2440, 2402,
        2380, 2356, 2330, 2318, 2295, 2310, 2270, 2242, 2205, 2230, 2265, 2240,
        2198, 2215, 2260, 2222, 2180, 2205, 2238, 2190, 2118, 1902, 1685, 1620,
        1704, 1930, 2085, 2160, 2187,
        // week in progress
        2240,
      ]),
    },
    breakdown: {
      kind: "share",
      caption: "Where the roles are · week 34",
      valueCaption: "Share of 2 187",
      rows: [
        { name: "Accounting bureaus", value: 1284 },
        { name: "In-house finance teams", value: 703 },
        { name: "Public sector", value: 128 },
        { name: "Staffing agencies", value: 72 },
      ],
    },
    read:
      "Postings rebounded from the summer floor, but the level is a tenth below the same week last year. Bureaus are the only employer type hiring more than they did in 2025.",
  },
  {
    id: "byrakartan",
    title: "Byråkartan",
    question: "Who is buying Sweden's accounting bureaus?",
    what: "Ownership changes and consolidation across Swedish accounting bureaus",
    source: "Bolagsverket · SCB",
    cadence: "Monthly",
    status: "planned",
    eta: "Q4 2026",
    href: "#market-research",
  },
  {
    id: "konkursvagen",
    title: "Konkursvågen",
    question: "How do bankruptcies track against new registrations?",
    what: "Bankruptcies by industry, indexed against new registrations",
    source: "Bolagsverket",
    cadence: "Weekly",
    status: "planned",
    eta: "Q4 2026",
    href: "#market-research",
  },
  {
    id: "momsklockan",
    title: "Momsklockan",
    question: "What does a VAT deadline do to a bureau's week?",
    what: "VAT filing volume against the Skatteverket deadline calendar",
    source: "Skatteverket",
    cadence: "Monthly",
    status: "planned",
    eta: "Q1 2027",
    href: "#market-research",
  },
  {
    id: "systemdelning",
    title: "Systemdelning",
    question: "Which accounting systems do Swedish SMEs actually run?",
    what: "Which accounting systems Swedish SMEs run, read off job advertisements",
    source: "Derived · Platsbanken",
    cadence: "Quarterly",
    status: "planned",
    eta: "Q2 2027",
    href: "#market-research",
  },
];

export const researchArticles: ResearchArticle[] = [
  {
    date: "2026-08-18",
    topic: "Nyregistreringar",
    title: "Consulting is carrying Sweden's company formation numbers",
    dek: "The post-summer rebound sits almost entirely in four SNI codes. What that says about who is actually starting companies.",
    href: "#",
  },
  {
    date: "2026-08-04",
    topic: "Method",
    title: "How we read SCB's Företagsdatabasen",
    dek: "The filters, the deduplication, and the two places the registry will quietly mislead you.",
    href: "#",
  },
  {
    date: "2026-07-22",
    topic: "Redovisningsjobb",
    title: "Bureaus are hiring for payroll, not bookkeeping",
    href: "#",
  },
  {
    date: "2026-06-30",
    topic: "Nyregistreringar",
    title: "Enskild firma is quietly shrinking",
    href: "#",
  },
  {
    date: "2026-06-12",
    topic: "Method",
    title: "Why we publish the query, not just the chart",
    href: "#",
  },
  {
    date: "2026-05-28",
    topic: "Corrections",
    title: "What we got wrong about the Q1 dip",
    href: "#",
  },
  {
    date: "2026-05-06",
    topic: "Nyregistreringar",
    title: "Stockholm's share of new companies has stopped growing",
    href: "#",
  },
  {
    date: "2026-04-14",
    topic: "Method",
    title: "Counting a company twice: what a registration actually is",
    href: "#",
  },
  {
    date: "2026-03-25",
    topic: "Redovisningsjobb",
    title: "Every accounting job ad that mentions a system, by system",
    href: "#",
  },
];

/* ───────────────────── derived figures ───────────────────────────── */

/** Every reading except the week still being counted. */
export function completePoints(series: ResearchSeries): ResearchPoint[] {
  const points = series.metric?.points ?? [];
  return points.filter((p) => !p.partial);
}

export function latestComplete(series: ResearchSeries): ResearchPoint | undefined {
  const complete = completePoints(series);
  return complete[complete.length - 1];
}

/** Latest complete reading against the mean of the four weeks before it. */
export function deltaVsFourWeekAverage(series: ResearchSeries): number | undefined {
  const complete = completePoints(series);
  if (complete.length < 5) return undefined;
  const window = complete.slice(-5, -1);
  const mean = window.reduce((sum, p) => sum + p.value, 0) / window.length;
  if (mean === 0) return undefined;
  return ((complete[complete.length - 1].value - mean) / mean) * 100;
}

/** Latest complete reading against the same week 52 weeks earlier. */
export function deltaVsLastYear(series: ResearchSeries): number | undefined {
  const complete = completePoints(series);
  if (complete.length < 53) return undefined;
  const now = complete[complete.length - 1].value;
  const then = complete[complete.length - 53].value;
  if (then === 0) return undefined;
  return ((now - then) / then) * 100;
}

/**
 * The window a chart or sparkline shows: `weeks` complete readings plus the
 * week in progress, so the hatched mark is never cropped out.
 */
export function windowPoints(series: ResearchSeries, weeks: number): ResearchPoint[] {
  const points = series.metric?.points ?? [];
  return points.slice(Math.max(0, points.length - (weeks + 1)));
}

/* ───────────────────── formatting ────────────────────────────────── */

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/**
 * Swedish thousands grouping, written out rather than via `toLocaleString`:
 * server and browser ICU builds disagree on the separator, which would
 * mismatch during hydration.
 */
export function formatCount(value: number): string {
  return Math.round(value)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, "\u00a0");
}

export function formatDelta(pct: number, digits = 1): string {
  return `${pct < 0 ? "↓" : "↑"} ${Math.abs(pct).toFixed(digits)}%`;
}

/** Formats an ISO date without `toLocaleDateString`, for the same reason. */
export function formatArticleDate(iso: string): string {
  const [year, month, day] = iso.split("-").map(Number);
  return `${MONTHS[month - 1]} ${String(day).padStart(2, "0")}, ${year}`;
}

export const liveSeries = researchSeries.filter((s) => s.metric);
