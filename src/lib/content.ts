/**
 * Single source of truth for every piece of copy, link, image path, and
 * mockup datum used across the landing page.
 *
 * To swap in your own brand:
 *   1. Replace files under `public/images/` and `public/fonts/`
 *   2. Edit the data exports below — every component reads from this file
 *   3. (Optional) update `siteMeta` in `src/app/layout.tsx`
 */

import type {
  AgenticGuideTab,
  AiItem,
  AutomationsTab,
  FeatureRow,
  FloatingContextCard,
  FooterColumn,
  InvestorLogo,
  NavDropdown,
  NavLink,
  PromptCard,
  ScaleCard,
} from "@/types/content";

/* ───────────────────── section copy ────────────────────────────────── */

/** Heading / sub / button labels that appear on the page, by section. */
export const siteCopy = {
  hero: {
    launchVideoLabel: "Beta launching soon",
    launchVideoThumb: "/images/video-thumb-brett.png",
    heading: "Accounting that scales with you",
    sub: "Focus on building. We'll handle the books. Bookkeeping, payroll, VAT, and reporting — automated and tailored for Swedish founders.",
    primaryCta: { label: "Get notified", href: "#waitlist" },
    secondaryCta: { label: "Talk to us" },
    backgroundImage: "/images/sky-bg-dark.jpg",
  },
  investors: {
    lead: "Built for Swedish founders, freelancers, and small teams who want",
    /** Words rendered with stronger weight. */
    emphasis: ["clarity", "speed"],
    conjunction: "and",
    final: "compliance without the admin",
  },
  product: {
    heading: "What we offer",
    sub: "Everything a small Swedish company needs to stay compliant — handled by us, automated where it makes sense.",
    replacesLabel: "Includes",
  },
  ai: {
    heading: "Your books, in conversation",
    sub: "Ask Igdrasil anything about your finances. Our assistant learns your business and turns numbers into plain answers — no spreadsheets, no jargon.",
    workingCardLabel: "Igdrasil · Working",
    workingLines: [
      "Reading invoices from Q2…",
      "Found 4 deductible expenses.",
      "Updated VAT report → ready to file.",
      "Drafted summary for your accountant.",
    ],
  },
  automations: {
    heading: "Skills and automations that handle the books for you",
    sub: "Bookkeeping, payroll, VAT — running quietly in the background. We integrate with the platforms you already use and add our own workflows on top.",
  },
  contextGraph: {
    heading: "Every receipt, invoice, and report — connected",
    sub: "We pull data from Fortnox, your bank, and your billing tools into one accounting picture. No more spreadsheets to glue it all together.",
  },
  engineersAgents: {
    heading: "Designed for founders who'd rather build than bookkeep",
    sub: "We do the accounting. You ship the product. Hands-on when you need us, automated when you don't.",
    lovedByLabel: "Loved by teams like",
  },
  builtToScale: {
    heading: "Built to scale with you",
    sub: "From your first invoice to your Series A — Igdrasil grows with the business, hands-on when needed and automated where it counts.",
    videoCard: {
      title: "How it works",
      sub: "A 2-minute walkthrough of Igdrasil in action.",
      cta: "Watch video",
      poster: "/images/grass-field.jpg",
    },
  },
  agenticGuides: {
    heading: "Get our pre-launch guide for Swedish founders",
    sub: "A practical handbook to bookkeeping, VAT, payroll, and Bokföringslagen — written for founders, not accountants.",
    downloadLabel: "Download",
    emailPlaceholder: "you@email.com",
    submitLabel: "Send me the guide",
    successHint: "Sent. Check your inbox.",
    aiToolsLabel: "We integrate with",
    backgroundImage: "/images/micro-night-bg.png",
  },
  finalCta: {
    heading: "Beta launching soon",
    sub: "Sign up to get notified when Igdrasil opens its doors.",
    grassImage: "/images/grass-field.jpg",
    primaryCta: { label: "Get notified", href: "#waitlist" },
    secondaryCta: { label: "Talk to us" },
  },
  footer: {
    tagline: "Bookkeeping on autopilot. Built in Stockholm.",
    twitter: "",
    linkedin: "",
    copyrightHolder: "Igdrasil AB",
  },
  musicPlayer: {
    track: "",
    artist: "",
    durationLabel: "",
    coverSrc: "",
  },
  authBar: {
    logIn: { label: "Contact", href: "mailto:support@igdrasil.se" },
    signUp: { label: "Get notified", href: "#waitlist" },
  },
} as const;

/* ───────────────────── nav ──────────────────────────────────────────── */

export const navDropdowns: NavDropdown[] = [
  {
    label: "Services",
    items: [
      { label: "Bookkeeping", href: "/#services", description: "Day-to-day bookkeeping handled, reconciled, and audit-ready." },
      { label: "Payroll", href: "/#services", description: "Salaries, taxes, and Skatteverket filings — automated." },
      { label: "VAT", href: "/#services", description: "Quarterly VAT reports prepared and filed on time." },
      { label: "Employer Reporting", href: "/#services", description: "AGI and employer declarations without the spreadsheets." },
      { label: "Recurring Reports", href: "/#services", description: "Monthly P&L, cash flow, and KPI snapshots." },
    ],
  },
];

export const navLinks: NavLink[] = [
  { label: "About", href: "/#about" },
  { label: "Contact", href: "mailto:support@igdrasil.se" },
];

/* ───────────────────── investors ─────────────────────────────────────── */

export const investors: InvestorLogo[] = [
  { name: "a16z", src: "/images/brand/a16z-com-dark.png", alt: "a16z" },
  { name: "Y Combinator", src: "/images/brand/ycombinator-com-dark.png", alt: "Y Combinator" },
  { name: "Flybridge Capital", src: "/images/brand/flybridge-com-dark.png", alt: "Flybridge Capital" },
  { name: "Graph Ventures", src: "/images/brand/graphventures-com-dark.png", alt: "Graph Ventures" },
  { name: "Verissimo Ventures", src: "/images/brand/verissimoventures-com-dark.png", alt: "Verissimo Ventures" },
];

/** Companies that built / use / are funded by Micro — feed the marquee track. */
export const ecosystemLogos: InvestorLogo[] = [
  { name: "Hyperspell", src: "/images/brand/hyperspell-com-dark.png", alt: "Hyperspell" },
  { name: "Superpower", src: "/images/brand/superpower-com-dark.png", alt: "Superpower" },
  { name: "Recall", src: "/images/brand/recall-ai-dark.png", alt: "Recall" },
  { name: "Hyper", src: "/images/brand/hyper-com-dark.png", alt: "Hyper" },
  { name: "Valley", src: "/images/brand/joinvalley-com-dark.png", alt: "Valley" },
  { name: "Google", src: "/images/brand/google-com-dark.png", alt: "Google" },
  { name: "Meta", src: "/images/brand/meta-com-dark.png", alt: "Meta" },
  { name: "OpenAI", src: "/images/brand/openai-com-dark.png", alt: "OpenAI" },
  { name: "Anthropic", src: "/images/brand/anthropic-com-dark.png", alt: "Anthropic" },
  { name: "Dropbox", src: "/images/brand/dropbox-com-dark.png", alt: "Dropbox" },
];

/* ───────────────────── #product accordion ─────────────────────────── */

export const featureRows: FeatureRow[] = [
  {
    id: "bookkeeping",
    title: "Bookkeeping",
    description: "Day-to-day bookkeeping handled by us — reconciled, categorized, and audit-ready in line with Bokföringslagen.",
    detail: "Receipts, invoices, and bank transactions reconciled monthly. Closing entries and year-end prep included.",
    replaces: [
      { name: "Fortnox", src: "/images/brand/gmail.png" },
      { name: "Visma", src: "/images/brand/superhuman-com-dark.png" },
    ],
  },
  {
    id: "payroll",
    title: "Payroll",
    description: "Salaries, taxes, pension, and Skatteverket filings — handled monthly, on time, every time.",
    detail: "AGI submissions, payslip generation, and employer contributions managed end-to-end.",
    replaces: [
      { name: "Skatteverket", src: "/images/brand/hubspot-com-dark.png" },
    ],
  },
  {
    id: "vat",
    title: "VAT",
    description: "Quarterly VAT reports prepared and filed with Skatteverket. No more deadlines on your calendar.",
    detail: "Reverse charge, EU sales, and import VAT — all handled correctly the first time.",
    replaces: [],
  },
  {
    id: "reports",
    title: "Recurring Reports",
    description: "Monthly P&L, cash flow snapshot, and KPI dashboards — delivered to your inbox.",
    detail: "Plain-English summaries with the numbers that matter most to founders.",
    replaces: [],
  },
];

/* ───────────────────── #ai expandable ─────────────────────────────── */

export const aiItems: AiItem[] = [
  {
    id: "answers",
    leadPhrase: "Answers in plain English",
    description:
      "ask anything about your books — VAT due, runway, profitability — and get a straight answer.",
  },
  {
    id: "reads",
    leadPhrase: "Reads your receipts and invoices",
    description:
      "drag and drop a PDF or photo, and the right entries land in the right accounts automatically.",
  },
  {
    id: "compliance",
    leadPhrase: "Keeps you compliant",
    description:
      "filings, deadlines, and Bokföringslagen requirements tracked and handled in the background.",
  },
];

/* ───────────────────── #automations tabs ───────────────────────────── */

const featuredCards = [
  { emoji: "☀️", title: "Morning Briefing", description: "Start your day with a summary of your calendar, priorities, and unread emails.", href: "#" },
  { emoji: "🔔", title: "Follow-up Finder", description: "Surface emails, tasks, and meetings that need follow-up.", href: "#" },
  { emoji: "📥", title: "Inbox Triage", description: "Categorize unread emails by priority and suggest quick replies.", href: "#" },
  { emoji: "📊", title: "Weekly Recap", description: "Full week summary — meetings, accomplishments, tasks, and goals.", href: "#" },
  { emoji: "📋", title: "Meeting Prep", description: "Before every meeting, get a briefing on attendees, recent emails, and open tasks.", href: "#" },
  { emoji: "🔬", title: "Contact Research", description: "Research newly added contacts and enrich their profiles automatically.", href: "#" },
];

const startupCards = [
  { emoji: "💸", title: "Investor Pipeline", description: "Track every investor conversation across emails, meetings, and follow-ups.", href: "#" },
  { emoji: "🚀", title: "Launch Tracker", description: "Co-ordinate launch tasks, partner reach-outs, and PR mentions in one view.", href: "#" },
  { emoji: "📨", title: "VC Outreach", description: "Personalised cold-emails using LinkedIn signals and warm intros.", href: "#" },
  { emoji: "🧑‍🤝‍🧑", title: "Hiring Loop", description: "Automate take-home reviews, scorecards, and candidate follow-ups.", href: "#" },
  { emoji: "📈", title: "Metrics Pulse", description: "Daily revenue, signup, and retention summary in your inbox.", href: "#" },
  { emoji: "🤝", title: "Partner Map", description: "Maintain partnership pipelines synced from Slack and email threads.", href: "#" },
];

const investorCards = [
  { emoji: "🧠", title: "Deal Memo", description: "Auto-draft investment memos from a founder call transcript.", href: "#" },
  { emoji: "📚", title: "Portfolio Digest", description: "Weekly portfolio update synthesised from founder emails and decks.", href: "#" },
  { emoji: "🔍", title: "Sourcing", description: "Discover companies that match your thesis and route them to your inbox.", href: "#" },
  { emoji: "🗓️", title: "LP Updates", description: "Generate quarterly LP letters from your portfolio activity.", href: "#" },
  { emoji: "🏷️", title: "Diligence Tracker", description: "Track diligence questions and references across deals.", href: "#" },
  { emoji: "📊", title: "Market Map", description: "Continuously refreshed market maps for the sectors you cover.", href: "#" },
];

const personalCards = [
  { emoji: "🛏️", title: "Sleep Mode", description: "Silence everything but family and people you've replied to recently.", href: "#" },
  { emoji: "🎁", title: "Birthday Reminders", description: "Surface birthdays from your contacts with thoughtful gift ideas.", href: "#" },
  { emoji: "📝", title: "Journal", description: "Daily journal entries auto-drafted from your meetings and tasks.", href: "#" },
  { emoji: "🍽️", title: "Dinner Plans", description: "Coordinate group dinners across emails and group chats.", href: "#" },
  { emoji: "✈️", title: "Trip Brief", description: "Pull together itineraries, contacts, and reservations for any trip.", href: "#" },
  { emoji: "🏃", title: "Habit Coach", description: "Track habits and nudge you toward your weekly goals.", href: "#" },
];

const emailCards = [
  { emoji: "✉️", title: "Reply Drafts", description: "Pre-written replies in your tone, ready to send.", href: "#" },
  { emoji: "🧹", title: "Inbox Sweep", description: "Archive newsletters and announcements automatically.", href: "#" },
  { emoji: "⏰", title: "Follow-up Nudges", description: "Remind you to follow up on emails left without a reply.", href: "#" },
  { emoji: "🗒️", title: "Snippets", description: "Reusable snippets pulled from past replies.", href: "#" },
  { emoji: "🪄", title: "Smart Forward", description: "Forward emails with one-click summaries and asks.", href: "#" },
  { emoji: "🔇", title: "Mute Threads", description: "Mute noisy threads with smart resurfacing.", href: "#" },
];

const crmCards = [
  { emoji: "🔗", title: "Auto-link", description: "Link contacts, companies, and deals from every conversation.", href: "#" },
  { emoji: "🔄", title: "Pipeline Sync", description: "Move deals through stages from email and meeting signals.", href: "#" },
  { emoji: "📇", title: "Profile Enrichment", description: "Pull job titles, companies, and links into contact records.", href: "#" },
  { emoji: "📊", title: "Relationship Score", description: "Surface who you're losing touch with and prompt re-connections.", href: "#" },
  { emoji: "🔔", title: "Stale Deal Alerts", description: "Get warned before a deal goes cold.", href: "#" },
  { emoji: "🧾", title: "Custom Properties", description: "Track anything you care about with custom fields.", href: "#" },
];

const projectCards = [
  { emoji: "📋", title: "Auto-tasks", description: "Spin up tasks from emails and meeting notes automatically.", href: "#" },
  { emoji: "🗂️", title: "Project Kickoff", description: "Bootstrap a project workspace from a single brief.", href: "#" },
  { emoji: "📅", title: "Standup Digest", description: "Daily standup digest pulled from PRs, tasks, and Slack.", href: "#" },
  { emoji: "🧭", title: "Roadmap Sync", description: "Keep public roadmaps in sync with internal task statuses.", href: "#" },
  { emoji: "🪧", title: "Status Reports", description: "Weekly project status reports written for you.", href: "#" },
  { emoji: "🚦", title: "Risk Watch", description: "Spot delivery risks before they slip the schedule.", href: "#" },
];

export const automationsTabs: AutomationsTab[] = [
  { id: "featured", label: "Featured", cards: featuredCards },
  { id: "startups", label: "Startups", cards: startupCards },
  { id: "investors", label: "Investors", cards: investorCards },
  { id: "personal", label: "Personal", cards: personalCards },
  { id: "email", label: "Email & Messaging", cards: emailCards },
  { id: "crm", label: "CRM", cards: crmCards },
  { id: "projects", label: "Projects", cards: projectCards },
];

/* ───────────────────── prompt grid ───────────────────────────────── */

export const promptCards: PromptCard[] = [
  { title: "Prep me", description: "Get prepared for your next meeting with context and talking points." },
  { title: "Draft email", description: "Draft a professional email based on context from your CRM and past threads." },
  { title: "Research person", description: "Get comprehensive background on any person in your network." },
  { title: "Summarize thread", description: "Get a clear summary of an email thread or discussion." },
  { title: "Intro", description: "Draft a warm intro email connecting two people." },
  { title: "Research", description: "Deep research on a person, company, or topic using web + your data." },
  { title: "What did I do", description: "Summarize what you've been working on recently." },
  { title: "Find all", description: "Build lists of entities matching specific criteria." },
];

/* ───────────────────── floating context cards (decorative) ──────── */

export const contextCards: FloatingContextCard[] = [
  {
    kind: "email",
    title: "Re: Q2 Partnership",
    subtitle: "alex@acme.com · 3h ago",
    fields: [
      { label: "From", value: "Alex Rivera" },
      { label: "To", value: "Sarah Chen" },
      { label: "Received", value: "Today, 2:14 PM" },
    ],
  },
  {
    kind: "meeting",
    title: "Investor Update Call",
    subtitle: "Tomorrow · 10:00 AM",
    fields: [
      { label: "Date", value: "Tomorrow, 10am" },
      { label: "Organizer", value: "Brett Goldstein" },
      { label: "Location", value: "Zoom" },
    ],
  },
  {
    kind: "person",
    title: "Sarah Chen",
    subtitle: "Head of Growth · Stripe",
    fields: [
      { label: "Email", value: "sarah@stripe.com" },
      { label: "Last met", value: "2 days ago" },
      { label: "Company", value: "Stripe" },
    ],
  },
  {
    kind: "company",
    title: "Acme Corp",
    subtitle: "Series B · SaaS",
    fields: [
      { label: "Employees", value: "150–200" },
      { label: "Domain", value: "acme.com" },
      { label: "HQ", value: "San Francisco" },
    ],
  },
  {
    kind: "slack",
    title: "#growth · 3 new messages",
    subtitle: "sarah · 15 minutes ago",
    fields: [
      { label: "Channel", value: "#growth" },
      { label: "From", value: "Sarah Chen" },
      { label: "Date", value: "Today, 4:32 PM" },
    ],
    iconSrc: "/images/brand/slack-com.png",
  },
  {
    kind: "file",
    title: "Q2 Pitch Deck.pdf",
    subtitle: "Shared · 2.4 MB",
    fields: [
      { label: "Type", value: "PDF Document" },
      { label: "Owner", value: "Brett Goldstein" },
      { label: "Modified", value: "Yesterday" },
    ],
    iconSrc: "/images/brand/dropbox-com.png",
  },
  {
    kind: "task",
    title: "Fix onboarding flow",
    subtitle: "ENG-482 · In Progress",
    fields: [
      { label: "Status", value: "In Progress" },
      { label: "Assignee", value: "Naveen S." },
      { label: "Due", value: "Next Friday" },
    ],
    iconSrc: "/images/brand/linear-app.png",
  },
  {
    kind: "deal",
    title: "Growth Plan · $299/mo",
    subtitle: "Active · Renews Apr 30",
    fields: [
      { label: "Amount", value: "$299/mo" },
      { label: "Customer", value: "Acme Corp" },
      { label: "Renews", value: "Apr 30, 2026" },
    ],
    iconSrc: "/images/brand/stripe-com.png",
  },
  {
    kind: "note",
    title: "Investor Update Call",
    subtitle: "Apr 15 · 45 min",
    fields: [
      { label: "Summary", value: "3 action items" },
      { label: "With", value: "Alex Rivera" },
      { label: "Date", value: "Apr 15, 2026" },
    ],
    iconSrc: "/images/brand/granola-ai.png",
  },
];

export const contextGraphFeatures: ScaleCard[] = [
  { title: "2,000+ Integrations", description: "Gmail, Slack, LinkedIn, Zoom, and thousands more. Your tools, connected." },
  { title: "Structured Data", description: "Every email, meeting, and task automatically organized with properties, tags, and types." },
  { title: "Custom Objects", description: "Deals, candidates, investors, bugs — model anything with custom objects and properties." },
  { title: "Interconnected", description: "People, companies, emails, and tasks all linked together. Search once, find everything." },
];

/* ───────────────────── built to scale ─────────────────────────────── */

export const scaleCards: ScaleCard[] = [
  { title: "Collaboration", description: "Real-time collaboration with your team on documents, tasks, and shared views." },
  { title: "Style", description: "Go beyond dark mode. Unique themes, fonts, and color palettes to match your vibe." },
  { title: "Speed", description: "Blazing fast keyboard shortcuts, search, and navigation." },
  { title: "Security", description: "Third-party tested. Encrypted in transit and at rest." },
  { title: "Mobile & Chrome", description: "There wherever you need it — iOS, Chrome extension, and Slack coming soon." },
  { title: "Customization", description: "Themes, fonts, color palettes, border radius, and density settings. Make it yours." },
];

/* ───────────────────── agentic guides ──────────────────────────────── */

export const agenticGuides: AgenticGuideTab[] = [
  {
    id: "fundraising",
    label: "Agentic Fundraising",
    title: "Agentic Fundraising",
    description: "39 skills, 6 agents, and curated resources for raising venture capital.",
    stats: "Skills & Strategies",
  },
  {
    id: "investing",
    label: "Agentic Startup Investing",
    title: "Agentic Startup Investing",
    description: "Tools for investors — sourcing, diligence, portfolio support, and LP reporting.",
    stats: "Skills & Strategies",
  },
  {
    id: "sales",
    label: "Agentic Sales",
    title: "Agentic Sales",
    description: "Pipeline, outreach, and renewals — agents that move every deal forward.",
    stats: "Skills & Strategies",
  },
  {
    id: "hiring",
    label: "Agentic Hiring",
    title: "Agentic Hiring",
    description: "Source, screen, schedule, and close — every step of hiring on autopilot.",
    stats: "Skills & Strategies",
  },
];

/* ───────────────────── footer ─────────────────────────────────────── */

export const footerColumns: FooterColumn[] = [
  {
    heading: "Services",
    links: [
      { label: "Bookkeeping", href: "/#services" },
      { label: "Payroll", href: "/#services" },
      { label: "VAT", href: "/#services" },
      { label: "Employer Reporting", href: "/#services" },
      { label: "Recurring Reports", href: "/#services" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About", href: "/#about" },
      { label: "Privacy", href: "/#legal" },
      { label: "Terms", href: "/#legal" },
      { label: "GDPR", href: "/#legal" },
    ],
  },
  {
    heading: "Contact",
    links: [
      { label: "support@igdrasil.se", href: "mailto:support@igdrasil.se" },
      { label: "+46 72 300 76 38", href: "tel:+46723007638" },
      { label: "Kornhamnstorg 61, 111 27 Stockholm", href: "https://maps.google.com/?q=Kornhamnstorg+61+Stockholm" },
    ],
  },
];

/* ───────────────────── hero dock buttons ─────────────────────────── */

export const heroDockButtons = [
  "Home",
  "AI Chat",
  "Email",
  "Document",
  "Task",
  "Company",
  "Person",
  "Event",
  "CRM",
  "Eng",
] as const;

export type HeroDockTab = (typeof heroDockButtons)[number];

/* ───────────────────── hero mockup panel data ──────────────────────── */

/**
 * Data for each panel in the hero dashboard mockup. Replace freely — each
 * panel renders a generic shape. The `HeroAppMockup` component expects
 * these keys; structure is intentional.
 */
export const heroMockupContent = {
  workspaceName: "Acme Inc",
  paneActionHint: "⌘K",

  home: {
    cards: [
      {
        title: "Today",
        subtitle: "3 meetings · 12 emails",
        items: [
          "10:00 — Investor Update Call",
          "13:30 — Sarah Chen sync",
          "16:00 — Eng triage",
        ],
      },
      {
        title: "Priorities",
        subtitle: "From your AI assistant",
        items: [
          "Reply to Alex Rivera",
          "Review Q2 Pitch Deck",
          "Approve ENG-482",
        ],
      },
      {
        title: "Recent",
        subtitle: "Across your workspace",
        items: [
          "📄 Q2 Pitch Deck.pdf",
          "📧 Re: Q2 Partnership",
          "👤 Sarah Chen",
        ],
      },
      {
        title: "Upcoming",
        subtitle: "Next 7 days",
        items: ["Tue — Board prep", "Thu — Eng demo", "Fri — Pricing review"],
      },
    ],
  },

  aiChat: {
    composerPlaceholder: "Ask Micro anything…",
    composerHotkey: "⌘ K",
    messages: [
      {
        who: "user" as const,
        text: "Summarize my unread emails and surface anything that needs a reply today.",
      },
      {
        who: "ai" as const,
        text: "You have 12 unread emails. 3 need a reply today:",
        bullets: [
          "Alex Rivera — Q2 Partnership terms",
          "Sarah Chen — Pricing for Acme expansion",
          "Brett Goldstein — Board deck v3 review",
        ],
      },
      { who: "user" as const, text: "Draft a reply to Alex." },
      {
        who: "ai" as const,
        text: "Draft ready. I'll thread your past replies for tone. Open to send?",
      },
    ],
  },

  email: {
    threads: [
      { from: "Alex Rivera", subject: "Re: Q2 Partnership", preview: "Following up on the partnership terms…", time: "3h" },
      { from: "Sarah Chen", subject: "Investor Update Call notes", preview: "Action items from yesterday's call…", time: "5h" },
      { from: "Brett Goldstein", subject: "Welcome to Micro!", preview: "We're so glad you're here…", time: "1d" },
      { from: "Naveen S.", subject: "ENG-482 review", preview: "Tracked the regression to…", time: "2d" },
      { from: "Slack — #growth", subject: "3 new in #growth", preview: "sarah just posted: …", time: "Tue" },
      { from: "Linear", subject: "Issue assigned to you", preview: "Linked to the new design…", time: "Wed" },
    ],
    bodyParagraphs: [
      "Hi Sarah,",
      "Thanks again for the call yesterday. As we discussed, here are the updated terms for Q2. Let me know what you think and we can sync Friday to finalize.",
      "A quick summary:",
    ],
    bodyBullets: [
      "Volume tier: 10k–20k seats",
      "Co-marketing on launch",
      "Renewal in October",
    ],
    signoff: "Best,",
  },

  document: {
    eyebrow: "Brief · Last edited 2 minutes ago",
    title: "Acme Q2 partnership memo",
    sections: [
      {
        kind: "p" as const,
        body:
          "We're moving Acme Corp from the Growth tier to a custom volume agreement. The team has signaled they want co-marketing on launch and a Q4 renewal review.",
      },
      { kind: "h2" as const, body: "Terms" },
      {
        kind: "ul" as const,
        items: [
          "Volume: 10k–20k seats",
          "Discount: 22% off list",
          "Renewal: October 2026",
        ],
      },
      { kind: "h2" as const, body: "Open questions" },
      {
        kind: "ul" as const,
        items: [
          "Single sign-on rollout window",
          "Annual co-marketing budget",
        ],
      },
    ],
  },

  task: {
    columns: [
      { title: "To do", tasks: ["Brief: Acme Q2", "Review pitch deck v3", "Schedule onboarding"] },
      { title: "In progress", tasks: ["ENG-482 onboarding flow", "Pricing exploration"] },
      { title: "Done", tasks: ["Investor update sent", "Q1 metrics report"] },
    ],
  },

  company: {
    list: ["Acme Corp", "Stripe", "Vercel", "Linear", "Notion"],
    detail: {
      name: "Acme Corp",
      initials: "A",
      tagline: "Series B · SaaS · 150–200 employees",
      properties: [
        ["Domain", "acme.com"],
        ["HQ", "San Francisco"],
        ["Owner", "Sarah Chen"],
        ["Stage", "Negotiating"],
        ["MRR", "$12,400"],
        ["Renews", "Oct 2026"],
      ] as [string, string][],
    },
  },

  person: {
    list: ["Sarah Chen", "Alex Rivera", "Jacob Peters", "Naveen S."],
    detail: {
      name: "Sarah Chen",
      initials: "SC",
      tagline: "Head of Growth · Stripe",
      properties: [
        ["Email", "sarah@stripe.com"],
        ["Phone", "—"],
        ["Last met", "2 days ago"],
        ["Threads", "14 emails"],
        ["Strength", "Strong"],
        ["LinkedIn", "linkedin.com/sarahc"],
      ] as [string, string][],
    },
  },

  event: {
    weekdays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    /** Day numbers (1-indexed within the visible 4-week grid) that should show a meeting block. */
    meetingDays: [3, 5, 11, 14, 17, 22],
    detail: {
      title: "Investor Update Call",
      subtitle: "Tomorrow · 10:00 AM",
      properties: [
        ["Date", "Tomorrow, 10am"],
        ["Organizer", "Brett Goldstein"],
        ["Location", "Zoom"],
        ["Attendees", "4 people"],
      ] as [string, string][],
    },
  },

  crm: {
    columns: ["Company", "Owner", "Stage", "MRR", "Renews"],
    rows: [
      ["Acme Corp", "Sarah Chen", "Negotiating", "$12,400", "Oct 26"],
      ["Globex", "Alex Rivera", "Discovery", "$4,200", "—"],
      ["Initech", "Jacob Peters", "Closed Won", "$28,000", "May 26"],
      ["Soylent", "Naveen S.", "Lost", "—", "—"],
      ["Hooli", "Brett Goldstein", "Negotiating", "$18,200", "Aug 26"],
    ] as string[][],
  },

  eng: {
    issues: [
      { id: "ENG-482", title: "Fix onboarding flow", status: "In Progress" as const, assignee: "Naveen S." },
      { id: "ENG-501", title: "Add SSO for Acme", status: "To do" as const, assignee: "Sarah Chen" },
      { id: "ENG-475", title: "Migrate to runtime cache", status: "In Review" as const, assignee: "Brett Goldstein" },
      { id: "ENG-468", title: "AI agent retries", status: "Done" as const, assignee: "Alex Rivera" },
    ],
  },
} as const;

/* ───────────────────── engineers / agents terminal lines ────────── */

export const terminalLines: Array<
  | { type: "command"; text: string }
  | { type: "out-ok"; text: string }
  | { type: "out"; text: string }
  | { type: "out-typing"; text: string }
> = [
  { type: "command", text: "micro contacts list --filter 'stage=lead'" },
  { type: "out-ok", text: "Found 47 contacts" },
  { type: "out", text: " ↳ Sarah Chen <sarah@acme.com>" },
  { type: "out", text: " ↳ James Park <james@startupxyz.com>" },
  { type: "out", text: " ↳ ...and 44 more" },
  { type: "command", text: "micro threads sync --inbox primary" },
  { type: "out-ok", text: "Synced 12 threads from primary inbox" },
  { type: "out-typing", text: "micro ai summari" },
];

/* ───────────────────── testimonial ───────────────────────────────── */

export const testimonial = {
  quote:
    "Bookkeeping is the one thing every founder dreads and the one thing every business needs to get right. Igdrasil takes it off the table — we ship product while they handle the books.",
  author: "Coming soon",
  role: "Beta clients launching Q2 2026",
  avatar: "/images/jacobpeters.jpeg",
};

export const founderNote = {
  body: [
    "Our vision is bookkeeping on autopilot. Accounting should feel effortless and stress-free — not a quarterly scramble through spreadsheets and receipts.",
    "We're a small, driven team building Igdrasil. Working with leading accounting platforms, we go further by automating and integrating our own workflows to streamline bookkeeping, payroll, VAT, employer reporting, and recurring reports.",
    "We're not a traditional firm. We work closely with our clients, stay accessible, and move fast. We're there when needed, growing alongside the companies we support.",
  ],
  signature: "/images/signature.png",
  avatar: "/images/brett.jpeg",
  name: "The Igdrasil team",
  title: "Stockholm, Sweden",
  twitter: "",
  linkedin: "",
};

/* ───────────────────── agent / engineer logos ───────────────────── */

export const agentLogos = [
  { name: "Claude", src: "/images/logos/claude.png" },
  { name: "Codex", src: "/images/logos/codex.png" },
  { name: "OpenClaw", src: "/images/logos/openclaw.png" },
  { name: "Hermes", src: "/images/logos/hermes-agent.jpg" },
];

export const aiToolLogos = [
  { name: "Cursor", src: "/images/brand/cursor-com-dark.png" },
  { name: "OpenClaw", src: "/images/brand/openclaw-cdn.png" },
];
