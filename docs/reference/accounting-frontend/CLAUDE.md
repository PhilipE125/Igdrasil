# Frontend — React 18 + Vite + TypeScript

## Component Architecture
- **Pages** (`pages/`) are thin wrappers: import a View component, wrap in `<MainLayout>`
- **Views** (`components/views/`) contain all logic, data fetching, and layout
- **UI primitives** from shadcn/ui (`components/ui/`) — always import from `@/components/ui/`
- Never put business logic in Page components

## Styling Rules
- Tailwind only, no CSS modules. Use `cn()` from `@/lib/utils` for conditional classes
- **Focus rings**: must reinforce existing border (gray, no offset gap) — NEVER use pink ring or `ring-offset-2`
- **Design tokens** (CSS variables in `index.css`): primary pink `#ee8fe0`, success green `#b0ee8f`, warning yellow `#eedd8f`
- **Font**: Inter Variable (normal weight 450, semibold 650)

## Data & State
- Auth/company state via React Context (`AuthProvider`, `CompanyProvider`)
- Server state via TanStack React Query — never store fetched data in local state
- API calls use raw `fetch` with auth wrappers in `lib/uploadApi.ts`, `lib/bankApi.ts`, etc.
- Real-time: `useRealtimeEvents` hook auto-invalidates React Query caches on WebSocket events

## TypeScript
- NOT strict mode (`noImplicitAny: false`, `strictNullChecks: false`)
- Don't add strict type annotations to existing code
- Path alias: `@/*` maps to `src/*`

## Testing
- Vitest + Testing Library (jsdom environment)
- Run: `npx vitest run --passWithNoTests`
