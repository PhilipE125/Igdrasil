/**
 * Shared content types for the micro.so clone.
 * Drives every section's data shape.
 */

export interface NavLink {
  label: string;
  href: string;
}

export interface NavDropdown {
  label: string;
  items: {
    label: string;
    href: string;
    description?: string;
    Icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  }[];
}

export interface InvestorLogo {
  name: string;
  src: string;
  alt: string;
}

/** Feature row in the "One place for everything" accordion. */
export interface FeatureRow {
  id: string;
  title: string;
  description: string;
  detail: string;
  replaces: { name: string; src: string }[];
  /** Optional pill shown next to the title, e.g. "Coming soon". */
  badge?: string;
}

/** Skill card in the "Skills and automations" tabbed grid. */
export interface SkillCard {
  emoji?: string;
  iconSrc?: string;
  title: string;
  description: string;
  href: string;
}

export interface AutomationsTab {
  id: string;
  label: string;
  cards: SkillCard[];
}

/** Quick-action prompt. */
export interface PromptCard {
  title: string;
  description: string;
}

export interface FloatingContextCard {
  kind: "email" | "meeting" | "person" | "company" | "slack" | "file" | "task" | "deal" | "note";
  title: string;
  subtitle: string;
  fields: { label: string; value: string }[];
  iconSrc?: string;
}

export interface ScaleCard {
  title: string;
  description: string;
}

export type RoadmapStatus = "live" | "now" | "soon" | "next" | "later";

export interface RoadmapMilestone {
  id: string;
  status: RoadmapStatus;
  /** Short pill label, e.g. "Live", "Soon", "Next". */
  statusLabel: string;
  title: string;
  description: string;
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  /** Visually feature this milestone (the open-source moment). */
  highlighted?: boolean;
}

export interface FooterColumn {
  heading: string;
  links: NavLink[];
}

export interface SocialLink {
  label: string;
  href: string;
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

/* ───────────────────── research ──────────────────────────────────── */

/** One weekly reading. `partial` marks a period that is still being counted. */
export interface ResearchPoint {
  /** Display label, e.g. "w34". */
  label: string;
  year: number;
  value: number;
  partial?: boolean;
}

/**
 * A standing market-research series: a query that re-runs on a fixed cadence
 * against a named public source. Planned series carry no metric yet.
 */
export interface ResearchSeries {
  id: string;
  title: string;
  /** The question the series answers, in one sentence. */
  question: string;
  /** One-line description for the register row. */
  what: string;
  source: string;
  cadence: string;
  status: "live" | "building" | "planned";
  /** Expected first publication, for planned series. */
  eta?: string;
  href: string;
  updatedLabel?: string;
  /** Discrete counts read best as columns; a level that persists reads as an area. */
  chart?: "column" | "area";
  metric?: {
    unit: string;
    /** Short unit shown under the register figure, e.g. "/ week". */
    shortUnit: string;
    /** Weekly readings, oldest first. The final entry is the week in progress. */
    points: ResearchPoint[];
  };
  breakdown?: {
    /** Ranked lists carry a delta per row; shares carry a percentage of the whole. */
    kind: "ranked" | "share";
    caption: string;
    /** Right-aligned label above the values. */
    valueCaption: string;
    rows: { name: string; sub?: string; value: number; deltaPct?: number }[];
    footnote?: string;
  };
  /** The written read on what the latest numbers show. */
  read?: string;
}

/** A dated piece of writing about one of the series. */
export interface ResearchArticle {
  /** ISO date — formatted for display at render time. */
  date: string;
  topic: string;
  title: string;
  dek?: string;
  href: string;
}
