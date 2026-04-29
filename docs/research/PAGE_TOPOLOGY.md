# PAGE TOPOLOGY — micro.so/

Captured at 1440×900 desktop viewport. Body height: **11772px**.

## Order (top to bottom)

| # | Section | Top (px) | Height (px) | id | Heading |
|---|---|---|---|---|---|
| 0 | **Header / Nav** | 0 | 68 | (none) | logo + nav + auth buttons |
| 1 | **Hero** | 0 | 1393 | (none) | "One place for work that works for you" — overlays the header |
| 1a | ↳ Logo wall (inside hero bottom) | ~1300 | ~93 | (none) | "Built, supported and used by people at top startups, enterprises…" |
| 2 | **#product** "One place for everything" | 1617 | 900 | `#product` | 4 expandable feature accordions: Email & Messaging / CRM / Meetings / Project Management |
| 3 | **#ai** "An AI assistant…" | 2517 | 900 | `#ai` | 3 expandable items + visual mockup (split layout) |
| 4 | **#automations** "Skills and automations…" | 3417 | 900 | `#automations` | Tabbed pills (Featured/Startups/Investors/Personal/Email/CRM/Projects) + skill cards grid |
| 5 | **Skill prompts grid** (likely under #automations) | ~4317 | ~400 | (none) | Prep me / Draft email / Research person / Summarize thread / Intro / Research / What did I do / Find all |
| 6 | **Testimonial** | ~4717 | ~500 | (none) | Jacob Peters quote, testimonial-bg image |
| 7 | **Personal context graph** | 5217 | 1780 | (none) | Layered card UI mockup + 4 feature cards (2,000+ Integrations / Structured Data / Custom Objects / Interconnected) |
| 8 | **Designed for agents and engineers** | (within ~6997) | — | (none) | Bash terminal mockup + "LOVED BY AGENTS LIKE" + Claude/Codex/OpenClaw/Hermes |
| 9 | **Built to scale with you** | 6997 | 1492 | (none) | 6 feature cards (Collaboration/Style/Speed/Security/Mobile & Chrome/Customization) + "How it works" video card |
| 10 | **Try Micro's skills and agents** | 8489 | 1024 | (none) | 4 tab buttons (Agentic Fundraising/Investing/Sales/Hiring) + "Works with most AI tools" + email signup |
| 11 | **Founder note** | ~9513 | ~900 | (none) | "We started Micro because…" + Brett Goldstein signature |
| 12 | **Final CTA "Organized"** | 10423 | 636 | (none) | huge serif headline + Sign up / Talk to sales |
| 13 | **Footer** | ~11059 | ~700 | (none) | columns + social + © 2026 |
| 14 | **Music player overlay** | fixed | — | — | bottom-right floating audio player ("New Computer" — Mika & The Romans) |

## Page-level architecture

- Page is a single long scroll. Nearly every named section uses `bg-background flex min-h-dvh items-center` — sections are **at least viewport-tall** and centered.
- `<html>` has `overflow-x-hidden overscroll-none bg-background dark` — default dark, no horizontal overflow, no overscroll bounce.
- `<body>` has font-sans + `overflow-x-hidden`.
- Header is **static**, sits inside hero, transparent — gains `data-scrolled="true"` past scroll threshold (state attribute drives behavior; class stays `bg-transparent`).
- Music player is a **floating overlay** at the bottom-right (collapsible, fixed position). Last in DOM after footer.

## Key layered/special compositions

- **Hero background:** dither pattern (radial mask) + sky-bg-dark.jpg (scaled 1.4× and rotated 0.5°) + bottom gradient fade to background. Plus Acme Inc app mockup card with 200px sidebar.
- **Personal context graph:** marquee-scrolling rows of integration logos (slack/dropbox/linear/stripe/granola repeated many times in DOM — see network requests).
- **Logo walls (investor logos):** 5 visible (a16z, YC, Flybridge, Graph Ventures, Verissimo) but logo.dev requests show way more (google/meta/openai/anthropic/dropbox/hyperspell/superpower/recall/hyper/joinvalley) repeated in 8+ marquee tracks.

## Z-index layers

- 0: section bg, dither, sky image
- 10: relative content
- Above all: floating music player overlay
- Header: not fixed (static), so no overlay z-index

## Scroll containers

- Body scrolls natively. `overscroll-none` disables bounce. No Lenis or Locomotive Scroll detected (single `transition: all` on header inner).
- No `scroll-snap` on the page.
