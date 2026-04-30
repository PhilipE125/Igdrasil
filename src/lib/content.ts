/**
 * Single source of truth for every piece of copy, link, image path, and
 * mockup datum used across the landing page.
 *
 * To swap in your own brand:
 *   1. Replace files under `public/images/` and `public/fonts/`
 *   2. Edit the data exports below — every component reads from this file
 *   3. (Optional) update `siteMeta` in `src/app/layout.tsx`
 */

import {
  BarChart3,
  BookOpen,
  CalendarClock,
  FileText,
  GitBranch,
  Landmark,
  Layers,
  Mail,
  Receipt,
  Send,
  Sparkles,
  Wallet,
} from "lucide-react";

import type {
  AutomationsTab,
  FeatureRow,
  FloatingContextCard,
  FooterColumn,
  InvestorLogo,
  NavDropdown,
  NavLink,
  PromptCard,
  RoadmapMilestone,
  ScaleCard,
} from "@/types/content";

/* ───────────────────── section copy ────────────────────────────────── */

/** Heading / sub / button labels that appear on the page, by section. */
export const siteCopy = {
  hero: {
    launchVideoLabel: "Beta launching soon",
    launchVideoThumb: "/images/video-thumb-brett.png",
    heading: "Accounting that scales with you",
    sub: "Automated accounting software for bookkeeping, payroll, VAT, and reporting. Pricing that doesn't run away as you scale.",
    primaryCta: { label: "Get notified", href: "#waitlist" },
    secondaryCta: { label: "Talk to us" },
    backgroundImage: "/images/igdrasil-meadow.webp",
    beta: {
      eyebrow: "Beta launching soon",
      offer: "First 100 users",
      price: "25 SEK / month",
      markup: "+ 10% markup on token consumption",
      note: "No add-on fees, ever.",
      cta: { label: "Join the beta", href: "#waitlist" },
    },
  },
  product: {
    heading: "What we offer",
    productSub: "Software that automates the books — from receipts and invoices into Fortnox today, to a full Swedish accounting platform tomorrow.",
    servicesSub: "A hands-on financial partner — bookkeeping, payroll, VAT, and reporting handled by us, on time, every time.",
    replacesLabel: "Includes",
  },
  ai: {
    heading: "Your books, in conversation",
    sub: "Ask Igdrasil anything about your finances. Our assistant learns your business and turns numbers into plain answers — no spreadsheets, no jargon.",
  },
  automations: {
    heading: "Skills and automations that handle the books for you",
    sub: "Bookkeeping, payroll, VAT — running quietly in the background. We integrate with the platforms you already use and add our own workflows on top.",
  },
  contextGraph: {
    heading: "Every receipt, invoice, and report — connected",
    sub: "We pull data from Fortnox, your bank, and your billing tools into one accounting picture. No more spreadsheets to glue it all together.",
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
  agentApi: {
    eyebrow: "API-first",
    heading: "Bring your own agents",
    sub: "Igdrasil is API-first by design. Connect Claude, Cursor, your in-house agents, or any MCP-aware client and let them read your books, file VAT, draft reports, or push receipts — programmatically, on your behalf.",
    lovedByLabel: "Loved by agents",
    bullets: [
      "Typed CLI and HTTP API for every entity — invoices, receipts, ledgers, payroll, VAT.",
      "MCP server out of the box, so agents discover your accounting actions automatically.",
      "Scoped tokens with per-agent audit trails — see exactly what each agent did, and when.",
    ],
    terminal: {
      titleBar: "~/igdrasil — agent session",
      lines: [
        { kind: "prompt", text: "igdrasil invoices list --filter 'status=unpaid'" },
        { kind: "ok", text: "Found 14 unpaid invoices" },
        { kind: "child", text: "Acme AB <billing@acme.com> · 12,500 SEK · 3d late" },
        { kind: "child", text: "Volvo Cars AB <ap@volvo.com> · 4,800 SEK · today" },
        { kind: "child", text: "...and 12 more" },
        { kind: "prompt", text: "igdrasil receipts upload ./q2/*.pdf" },
        { kind: "ok", text: "Categorized 23 receipts in 1.2s" },
        { kind: "child", text: "Travel: 9 · Meals: 6 · Software: 5 · Other: 3" },
        { kind: "prompt", text: "igdrasil vat draft --period Q2-2026" },
        { kind: "ok", text: "Draft VAT report ready for review" },
        { kind: "child", text: "Outgoing: 184,250 SEK · Incoming: 42,180 SEK" },
        { kind: "typing", text: "igdrasil ai summari" },
      ],
    },
  },
  pricing: {
    eyebrow: "Pricing",
    heading: "Built for business owners, not investors",
    sub: "Every business is legally required to do accounting. We don't think a basic obligation should cost a fortune. Igdrasil is priced to be the most affordable line item on your P&L — a flat fee plus a small markup on AI workflows that actually deliver value.",
    flatFeeLabel: "/ month flat",
    markupLabel: "markup on token consumption",
    simLabel: "Cost simulation",
    invoicesLabel: "invoices / month",
    breakdown: {
      flat: "Flat fee",
      tokens: "AI tokens",
      markup: "Markup (10%)",
      total: "Estimated total",
    },
    note: "No hidden fees. No per-seat pricing. No surprise invoices at year-end.",
    cta: { label: "Get notified at launch", href: "#waitlist" },
  },
  roadmap: {
    eyebrow: "Roadmap",
    heading: "Building Igdrasil in the open",
    sub: "We're shipping fast and showing our work. Here's what's live, what's next, and where we're headed.",
    repoLabel: "Watch the repo",
    repoHref: "https://github.com/igdrasil-ab",
    backgroundImage: "/images/micro-night-bg.png",
  },
  finalCta: {
    heading: "Beta launching soon",
    grassImage: "/images/igdrasil-meadow.webp",
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
    label: "Product",
    items: [
      { label: "Automated bookkeeping", href: "/#product", description: "A complete Swedish accounting platform — coming soon.", Icon: Layers },
      { label: "Receipts & invoices to Fortnox", href: "/#product", description: "Drop a document — we extract, classify, and sync it.", Icon: Receipt },
      { label: "AI Assistant", href: "/#product", description: "Ask anything about your books — answered instantly.", Icon: Sparkles },
      { label: "Reports, Analytics & Integrations", href: "/#product", description: "Live KPIs and connectors — more coming soon.", Icon: BarChart3 },
    ],
  },
  {
    label: "Services",
    items: [
      { label: "Bookkeeping", href: "/#services", description: "Day-to-day bookkeeping handled, reconciled, and audit-ready.", Icon: BookOpen },
      { label: "Payroll", href: "/#services", description: "Salaries, taxes, and Skatteverket filings — automated.", Icon: Wallet },
      { label: "VAT", href: "/#services", description: "Quarterly VAT reports prepared and filed on time.", Icon: Receipt },
      { label: "Employer Reporting", href: "/#services", description: "AGI and employer declarations without the spreadsheets.", Icon: FileText },
      { label: "Recurring Reports", href: "/#services", description: "Monthly P&L, cash flow, and KPI snapshots.", Icon: CalendarClock },
    ],
  },
];

export const navLinks: NavLink[] = [
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

export const productFeatureRows: FeatureRow[] = [
  {
    id: "automated-bookkeeping",
    title: "Automated bookkeeping",
    description: "A complete Swedish accounting platform — ledger, filings, and dashboards — powered by AI from day one.",
    detail: "Double-entry ledger, BAS chart of accounts, VAT, payroll, and year-end closing built natively, not bolted on.",
    replaces: [],
    badge: "Coming soon",
  },
  {
    id: "receipts-to-fortnox",
    title: "Receipts & invoices → Fortnox",
    description: "Drop any receipt or invoice — we extract, classify, and push it straight to Fortnox.",
    detail: "Supplier, amounts, VAT, dates, and BAS account mapped automatically. Two-way Fortnox sync with attachments included.",
    replaces: [],
  },
  {
    id: "ai-assistant",
    title: "AI Assistant",
    description: "Ask anything about your books and get a plain-English answer in seconds.",
    detail: "Reads your invoices, drafts reports, and flags anomalies before they become problems.",
    replaces: [],
  },
  {
    id: "reports-analytics-integrations",
    title: "Reports, Analytics & Integrations",
    description: "P&L, cash flow, KPI dashboards, and connectors to the tools you already use.",
    detail: "Live dashboards built for founders, plus a growing roster of bank, billing, and ERP integrations.",
    replaces: [],
    badge: "More coming soon",
  },
];

export const serviceFeatureRows: FeatureRow[] = [
  {
    id: "bookkeeping",
    title: "Bookkeeping",
    description: "Day-to-day bookkeeping handled by us — reconciled, categorized, and audit-ready in line with Bokföringslagen.",
    detail: "Receipts, invoices, and bank transactions reconciled monthly. Closing entries and year-end prep included.",
    replaces: [],
  },
  {
    id: "payroll",
    title: "Payroll",
    description: "Salaries, taxes, pension, and Skatteverket filings — handled monthly, on time, every time.",
    detail: "AGI submissions, payslip generation, and employer contributions managed end-to-end.",
    replaces: [],
  },
  {
    id: "vat",
    title: "VAT",
    description: "Quarterly VAT reports prepared and filed with Skatteverket. No more deadlines on your calendar.",
    detail: "Reverse charge, EU sales, and import VAT — all handled correctly the first time.",
    replaces: [],
  },
  {
    id: "employer-reporting",
    title: "Employer Reporting",
    description: "AGI and employer declarations without the spreadsheets.",
    detail: "Monthly arbetsgivardeklarationer prepared and filed — contributions, benefits, and beneficiaries all reconciled.",
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

/* ───────────────────── #automations tabs ───────────────────────────── */

const featuredCards = [
  { emoji: "📩", title: "Auto-read invoices", description: "Drop any PDF or photo. Supplier, amounts, VAT, dates — extracted and posted to the right account.", href: "#" },
  { emoji: "🏦", title: "Auto-match bank lines", description: "Nordea, SEB, Swedbank, Handelsbanken — every transaction matched to its invoice.", href: "#" },
  { emoji: "🪿", title: "Ask, then act", description: "The Goose assistant posts entries, approves invoices, and runs syncs straight from chat.", href: "#" },
  { emoji: "💬", title: "Reports in plain Swedish", description: "'Show me Q2 VAT' or 'who's late paying me' — answered live, with charts inline.", href: "#" },
  { emoji: "🔁", title: "Two-way Fortnox sync", description: "Vouchers, suppliers, projects, and SIE-4 files flow both ways. No copy-paste.", href: "#" },
  { emoji: "🧾", title: "BAS auto-booking", description: "Every line classified to the right 4-digit BAS account, automatically.", href: "#" },
];

const receiptsCards = [
  { emoji: "📷", title: "Snap & send", description: "Photo a receipt to your private Telegram bot — it lands in your books in seconds.", href: "#" },
  { emoji: "📥", title: "Drag-and-drop upload", description: "PDFs, JPEGs, PNGs in. Bookkept entries out. No typing, no spreadsheets.", href: "#" },
  { emoji: "📨", title: "Email-in inbox", description: "Forward bills to your private Igdrasil address — they appear in your books.", href: "#" },
  { emoji: "🧾", title: "BAS classification", description: "Every line mapped to the correct Swedish BAS account, every time.", href: "#" },
  { emoji: "💱", title: "FX-aware entries", description: "EUR / USD / anything — converted at the Riksbanken rate, to the öre.", href: "#" },
  { emoji: "🔁", title: "Dedupe & lineage", description: "Duplicates blocked by content hash. Every entry linked back to its source document.", href: "#" },
];

const bankCards = [
  { emoji: "🏦", title: "Statement import", description: "Juni, Lunar, Nordea, SEB, Swedbank, Handelsbanken, and Skatteverket CSV — all supported.", href: "#" },
  { emoji: "🔎", title: "OCR fast-match", description: "Bank reference numbers (OCR) parsed and matched to invoices in milliseconds.", href: "#" },
  { emoji: "🤝", title: "AI fallback match", description: "When OCR misses, the assistant finds the right invoice from amount, date, and supplier.", href: "#" },
  { emoji: "💳", title: "Card expense rules", description: "Receipts paid on the company card classified by card last-four and expense rules.", href: "#" },
  { emoji: "🪙", title: "Multi-account, multi-currency", description: "IBAN and currency per account, with reconciliation status at a glance.", href: "#" },
  { emoji: "📤", title: "Bankgiro & PlusGiro", description: "Outgoing payments matched to supplier invoices, ready for your bank file.", href: "#" },
];

const gooseCards = [
  { emoji: "🪿", title: "Chat-driven actions", description: "Tell Goose to post a journal entry — it does it, with an approval card before anything posts.", href: "#" },
  { emoji: "✅", title: "Approve in chat", description: "Send invoices, create suppliers, kick off Fortnox sync — straight from a message.", href: "#" },
  { emoji: "🇸🇪", title: "Skatteverket-grounded", description: "Answers backed by an indexed knowledge base of current Swedish tax guidance.", href: "#" },
  { emoji: "🌐", title: "Web research built in", description: "Goose can browse the web to verify org numbers, tax rules, and FX rates.", href: "#" },
  { emoji: "🛠️", title: "60+ MCP tools", description: "Every Fortnox action — and every internal action — exposed as a tool the assistant can call.", href: "#" },
  { emoji: "🔮", title: "Pick your model", description: "Anthropic Claude or Google Gemini — your choice, configurable per user and per company.", href: "#" },
];

const reportsCards = [
  { emoji: "💬", title: "Ask in plain language", description: "'Show me Q2 VAT', 'cash flow last month', 'top 5 suppliers' — answered live.", href: "#" },
  { emoji: "📈", title: "Live KPIs", description: "Net profit, revenue, expenses, document count — updated the moment something changes.", href: "#" },
  { emoji: "🧾", title: "Momsdeklaration", description: "VAT form SKV 4700 computed automatically — standard, reduced, reverse charge, exports.", href: "#" },
  { emoji: "🪞", title: "Trial balance & P&L", description: "Full COA balances and statements on demand. Auditor-ready exports in seconds.", href: "#" },
  { emoji: "📑", title: "INK2 & NE-bilaga", description: "Year-end tax filings drafted with the numbers already in place.", href: "#" },
  { emoji: "🧮", title: "Custom charts inline", description: "Ask for a chart in chat — get a chart, with the underlying numbers a click away.", href: "#" },
];

const fortnoxCards = [
  { emoji: "🔁", title: "Two-way sync", description: "Vouchers, suppliers, accounts, fiscal years, projects, and cost centers — all kept in lockstep.", href: "#" },
  { emoji: "📎", title: "Vouchers + attachments", description: "Push journal entries with their source PDFs attached, in a single call.", href: "#" },
  { emoji: "🏢", title: "Bureau (byrå) mode", description: "Run multiple client companies from one accountancy login.", href: "#" },
  { emoji: "📥", title: "SIE-4 import", description: "Bring your history in: account mapping, opening balances, vouchers — nothing left behind.", href: "#" },
  { emoji: "📤", title: "SIE-4 export", description: "Leave whenever you want. Your full ledger, in the Swedish standard format.", href: "#" },
  { emoji: "⏱️", title: "Rate-limit aware", description: "Built for Fortnox's 4 req/sec ceiling — nothing dropped, nothing duplicated.", href: "#" },
];

export const automationsTabs: AutomationsTab[] = [
  { id: "featured", label: "Featured", cards: featuredCards },
  { id: "receipts", label: "Receipts & Invoices", cards: receiptsCards },
  { id: "bank", label: "Bank Matching", cards: bankCards },
  { id: "goose", label: "Goose Assistant", cards: gooseCards },
  { id: "reports", label: "Reports & Insights", cards: reportsCards },
  { id: "fortnox", label: "Fortnox Sync", cards: fortnoxCards },
];

/* ───────────────────── prompt grid ───────────────────────────────── */

export const promptCards: PromptCard[] = [
  { title: "Run month-end", description: "Close last month: post adjustments, run Momsdeklaration, file." },
  { title: "Match the bank", description: "Reconcile every transaction in this month's statement." },
  { title: "Show VAT", description: "What do I owe Skatteverket this quarter?" },
  { title: "Book this receipt", description: "Take this PDF, classify it, and post the entry." },
  { title: "Sync to Fortnox", description: "Push open vouchers from this period to Fortnox." },
  { title: "Late payers", description: "Which customers are more than 30 days overdue?" },
  { title: "Burn rate", description: "How much cash am I burning each month, and where does it go?" },
  { title: "Find the invoice", description: "Pull up the Vattenfall invoice from March." },
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

export const roadmapMilestones: RoadmapMilestone[] = [
  {
    id: "open-source",
    status: "now",
    statusLabel: "Next up",
    title: "Open source on GitHub",
    description:
      "Putting the engine in the open. Read the code, file issues, contribute, or self-host — Igdrasil built in public.",
    Icon: GitBranch,
    highlighted: true,
  },
  {
    id: "email-inbox",
    status: "soon",
    statusLabel: "Soon",
    title: "Forward invoices to a private inbox",
    description:
      "Send bills to your private Igdrasil address — no upload, no app, no friction.",
    Icon: Mail,
  },
  {
    id: "telegram",
    status: "soon",
    statusLabel: "Soon",
    title: "Telegram integration",
    description:
      "Snap a receipt and send it to your private Igdrasil bot — it lands straight in your automated accounting flow.",
    Icon: Send,
  },
  {
    id: "gocardless",
    status: "soon",
    statusLabel: "Soon",
    title: "GoCardless bank sync",
    description:
      "Connect your bank account directly. Transactions pulled and reconciled up to four times a day.",
    Icon: Landmark,
  },
  {
    id: "wages",
    status: "soon",
    statusLabel: "Soon",
    title: "Wages and Skatteverket filings",
    description:
      "Run payroll and upload compliant employer documents — AGI, arbetsgivardeklaration — straight to Skatteverket.",
    Icon: Wallet,
  },
  {
    id: "standalone",
    status: "soon",
    statusLabel: "Soon",
    title: "A fully compliant standalone accounting platform",
    description:
      "Igdrasil isn't just an AI layer bolted onto someone else's tool. It's a complete Swedish accounting suite — ledger, reports, filings — fused with our AI automations from day one.",
    Icon: Layers,
    highlighted: true,
  },
];

/* ───────────────────── footer ─────────────────────────────────────── */

export const footerColumns: FooterColumn[] = [
  {
    heading: "Product",
    links: [
      { label: "Automated bookkeeping", href: "/#product" },
      { label: "Receipts & invoices → Fortnox", href: "/#product" },
      { label: "AI Assistant", href: "/#product" },
      { label: "Reports, Analytics & Integrations", href: "/#product" },
    ],
  },
  {
    heading: "Services",
    links: [
      { label: "Bookkeeping", href: "/#product" },
      { label: "Payroll", href: "/#product" },
      { label: "VAT", href: "/#product" },
      { label: "Employer Reporting", href: "/#product" },
      { label: "Recurring Reports", href: "/#product" },
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
  team: [
    { name: "Philip", avatar: "/images/team/philip.jpeg" },
    { name: "Edith", avatar: "/images/team/edith.jpeg" },
    { name: "Tasmia", avatar: "/images/team/tasmia.jpeg" },
  ],
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

