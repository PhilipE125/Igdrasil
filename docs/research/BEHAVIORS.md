# BEHAVIORS — micro.so/

The behavior bible. Reference when writing every component spec.

## Global

- **Theme:** Default `dark` (`<html class="dark">`). `color-scheme: dark` is set inline. Light theme exists (toggle in hero) but dark is canonical.
- **Smooth scroll library:** None detected. Native scrolling with `overscroll-none` to disable bounce.
- **Scroll snap:** None.
- **Transitions default:** `0.15s cubic-bezier(.4,0,.2,1)`.

## Header / Nav

- **Position:** `static` (NOT fixed/sticky). Sits inside the hero at top.
- **Background:** transparent always. Inner wrap can blur on mobile menu open.
- **Scroll attribute:** `<header>` gains `data-scrolled="true"` past ~600px scroll. **Class does NOT change** — but the rest of the page may use `[data-scrolled]` selectors. Visible effect: subtle (transparent throughout). Test before assuming a visual change.
- **Mobile menu:** sets `data-state="active"` on header. Inner wrap then becomes `bg-card/50` + `backdrop-blur` + `h-screen` (full-screen overlay).
- **Dropdowns:** "Product" and "Resources" use Radix-style expandable buttons (`expandable expandable=true`).

## Hero

- **Backdrop layers** (z-stack, bottom up): solid bg `#1c1c1c` → dither pattern (opacity 0.25, radial mask `radial-gradient(48% 25% at 50% 56%, black, transparent)`) → sky-bg-dark.jpg (scaled 1.4×, translated -17% Y, rotated 0.5°) → bottom fade gradient (transparent 50% → bg 75% → bg 100%).
- **Headline:** `perfectlyNineties` 72px/72px, weight 900, letter-spacing 1.44px, white.
- **Sub-text:** white/90, max-w-2xl, 18-20px, sans.
- **Sign up button:** `bg-foreground` (white) + `text-background` (dark), inset shadow `inset 0 -2px 0 rgba(0,0,0,0.2)`, h-10, rounded-[10px], px-6.
- **Talk to sales button:** `bg-layer-3` (#292929), `text-foreground`, border-input, h-10, rounded-[10px].
- **Watch launch video pill:** small h-7, rounded-[8px], bg-layer-3, video-thumb-brett.png on the left.
- **App mockup:** giant 16/9 dashboard card with 200px sidebar. `bg-layer-1`, ring `foreground/10`, rounded-2xl, shadow-2xl. Sidebar contains Acme Inc logo (M in blue square), nav buttons (Home/AI Chat/Email/etc.), theme toggle.

## #product (One place for everything)

- **Layout:** Heading + sub + 4 expandable rows (accordion).
- **Rows:** Email & Messaging | CRM | Meetings | Project Management.
- **Expanded state:** shows description + "Replaces" + small logo row (Gmail/Superhuman/Beeper etc.).
- **Interaction model:** click-to-expand accordion. Heading button has `expandable expanded` attribute. Default expanded: Email & Messaging.

## #ai (AI assistant)

- **3 expandable items:** "AI takes actions on your behalf" (default expanded), "AI search across your workspace", "AI updates CRM records automatically".
- **Default expanded:** the first one. Per-item shows bold lead phrase + " — " + description.
- **Visual:** Right side likely has an app mockup that swaps as different items are expanded (split layout — to verify).

## #automations (Skills and automations)

- **Tabs:** Featured | Startups | Investors | Personal | Email & Messaging | CRM | Projects.
- **INTERACTION MODEL:** click-driven tabs (per snapshot, all are buttons; default selected is Featured).
- **Cards (Featured tab):** 6 cards with emoji icons + title + description. Examples: ☀️ Morning Briefing / 🔔 Follow-up Finder / 📥 Inbox Triage / 📊 Weekly Recap / 📋 Meeting Prep / 🔬 Contact Research.
- **Each tab swaps the card grid** — must extract content per tab.
- **Sub-grid below:** 8 quick prompts (Prep me / Draft email / Research person / Summarize thread / Intro / Research / What did I do / Find all).

## Personal context graph

- **Marquee animation:** rows of integration logos scroll horizontally. `marquee-scroll` keyframe is defined globally. Multiple rows scrolling at different speeds (a16z/YC/Flybridge etc. + slack/dropbox/linear/stripe/granola etc.).
- **Layered cards:** floating UI cards (Re: Q2 Partnership email, Investor Update Call meeting, Sarah Chen contact, Acme Corp company, Q2 Pitch Deck.pdf, Growth Plan stripe, Investor Update Call meeting note, Slack #growth message, Linear ENG-482 task) — these are **decorative composition cards** stacked in a 3D-feel layout.

## "Designed for agents and engineers"

- **Bash terminal mockup:** typewriter effect likely. Multiple commands shown stacked: `micro contacts list --filter 'stage=lead'` → `micro threads sync --inbox primary` → `micro ai summari` (cut off mid-word — definitely a typewriter animation).
- **Below:** "LOVED BY AGENTS LIKE" subhead + 4 logos (Claude / Codex / OpenClaw / Hermes).

## Built to scale with you

- **Grid:** 6 feature cards + 1 video card "How it works" (button to play).
- **Equal-radius cards** with images at top + heading + description.

## Try Micro's skills and agents

- **4 tab buttons:** Agentic Fundraising / Agentic Startup Investing / Agentic Sales / Agentic Hiring (default Agentic Fundraising).
- **INTERACTION MODEL:** click-driven tabs. Default state shows "Agentic Fundraising" preview card with download + email signup.
- **AI tools row:** Claude Code / Cursor / OpenClaw — ditherized icons.

## Final CTA "Organized"

- **Heading:** "Organized" — likely huge `perfectlyNineties` serif, similar to hero h1.
- **Sub:** "So you don't have to be."
- **CTAs:** Sign up + Talk to sales.

## Music player overlay

- Bottom of page, **fixed**, collapsible.
- Shows: album cover (mika-album-2.png) + "New Computer" / "Mika & The Romans" + play/skip controls + 0:00 / 2:57 timestamps + Collapse button.
- Has equalizer-style animations (`eq1`, `eq2`, `eq3` keyframes).

## Animations & keyframes (defined in stylesheet)

- `spin`, `spin-slow`, `pulse` — utility
- `eq1`, `eq2`, `eq3` — audio bars in music player
- `marquee-scroll` — horizontal marquee for logo wall and context graph
- `gradient-shift` — animated gradients
- `enter`, `exit` — Radix-style transitions
- `accordion-down`, `accordion-up` — for expandable rows
- `expandProgress` — likely progress bar fill

## Hover states

- **Buttons:** `btn-hover-overlay` utility — adds a subtle white overlay (`--hover-overlay: #ffffff0d` = 5% white) on hover.
- **Sign up (primary) button:** `hover:bg-foreground/85 hover:shadow-none` — drops the inset shadow on hover.
- **Cards:** transitions are `all 0.15s` by default. No explicit hover scale/shadow detected in main grids (verify per component).

## Responsive (top-level observed)

- **`max-sm:` ⇒ <640px:** hero buttons stack full-width; mockup card becomes `h-[75vh] w-[140%]` and only `rounded-l-2xl`.
- **`md:` ⇒ ≥768px:** typography scales up (`md:py-32` etc.).
- **`lg:` ⇒ ≥1024px:** hero h1 7xl (72px); top-level padding `lg:pt-40`; mockup sidebar widens to 220px.
- Common breakpoints: 640 / 768 / 1024 / 1280. Standard Tailwind.

## What still needs verification per-section (during specs)

- [ ] Per-tab card content for #automations (click each tab)
- [ ] Per-item app mockup for #ai (verify if it swaps with expansion)
- [ ] Marquee speed/direction for context graph rows
- [ ] Per-tab content for "Try Micro's skills" Agentic guides
- [ ] Final "Organized" CTA exact font/size
- [ ] Music player exact rect + animation specs
- [ ] Light-theme variants if user toggles theme (low priority — keep dark canonical)
