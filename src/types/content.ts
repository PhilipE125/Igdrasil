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
  items: { label: string; href: string; description?: string }[];
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
}

/** Item in the "AI assistant" expanding list. */
export interface AiItem {
  id: string;
  leadPhrase: string;
  description: string;
}

/** Skill card in the "Skills and automations" tabbed grid. */
export interface SkillCard {
  emoji: string;
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

export interface AgenticGuideTab {
  id: string;
  label: string;
  title: string;
  description: string;
  stats: string;
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
