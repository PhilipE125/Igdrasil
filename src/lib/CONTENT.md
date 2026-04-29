# Plugging in your own brand

Every component reads from `src/lib/content.ts`. To rebrand the site you only need to edit that file and (optionally) replace assets in `public/`.

## What lives where

| Group | Export | Used by |
|---|---|---|
| Section copy (headings, sub-text, CTA labels) | `siteCopy` | every section component |
| Top nav | `navDropdowns`, `navLinks` | `SiteHeader` |
| Hero dashboard mockup data | `heroMockupContent`, `heroDockButtons` | `HeroAppMockup` |
| Investor / ecosystem logos | `investors`, `ecosystemLogos` | `InvestorMarquee`, `ContextGraph` |
| Product accordion | `featureRows` | `ProductFeatures` |
| AI assistant items | `aiItems` | `AiAssistant` |
| Skills/automations tabs + cards | `automationsTabs`, `promptCards` | `AutomationSkills` |
| Testimonial | `testimonial` | `Testimonial` |
| Floating context cards (decorative) | `contextCards`, `contextGraphFeatures` | `ContextGraph` |
| Engineers/Agents terminal lines | `terminalLines`, `agentLogos` | `EngineersAgents` |
| Built-to-scale cards | `scaleCards` | `BuiltToScale` |
| Agentic guide tabs + AI tool logos | `agenticGuides`, `aiToolLogos` | `AgenticGuides` |
| Founder note | `founderNote` | `FounderNote` |
| Footer columns | `footerColumns` | `SiteFooter` |

## Asset paths
All image paths resolve against `public/`:
- Brand logos → `public/images/brand/*.png` (downloaded by `scripts/download-assets.mjs`)
- Hero / section backgrounds → `public/images/sky-bg-dark.jpg`, `grass-field.jpg`, `micro-night-bg.png`, `testimonial-bg-dark.jpg`
- Avatars / signatures → `public/images/brett.jpeg`, `jacobpeters.jpeg`, `signature.png`
- Album art → `public/audio/mika-album-2.png`
- Fonts → `public/fonts/` (registered in `src/app/layout.tsx`)
- Favicon / OG → `public/favicon.ico`, `public/images/og.png`, `public/images/icon.svg`

## Page metadata (`<title>`, OG, favicon)
Edit the `metadata` object in `src/app/layout.tsx`.

## Theme colors
The dark theme is canonical and lives in `src/app/globals.css` under `.dark` (and `:root` for the light theme). Brand colors (`--color-blue-main`, etc.) are also there.

## Hero app mockup
The 10 sidebar tabs (Home / AI Chat / Email / Document / Task / Company / Person / Event / CRM / Eng) each render a dedicated panel from `heroMockupContent`. To swap the entire hero mockup for your own UI:
1. Replace the contents of `src/components/HeroAppMockup.tsx`
2. Or keep the panel structure and edit the `heroMockupContent` data
