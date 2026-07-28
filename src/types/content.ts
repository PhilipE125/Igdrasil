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
