# CLAUDE.md — accounting-pipeline

## Project Overview

Igdrasil: a full-stack accounting automation platform for Swedish BAS accounting standards. Processes invoices/receipts, automates journal entries, and integrates with Fortnox. Multi-tenant (company_id on all tables).

## Architecture

```
frontend/          → React 18 + Vite SPA (TypeScript, shadcn/ui, Tailwind)
backend/           → FastAPI REST API (Python 3.13, async SQLAlchemy + asyncpg)
event-processor/   → Real-time WebSocket server (Rust, Axum 0.8, tokio-postgres)
accounting-engine/ → Double-entry bookkeeping engine (Rust, PyO3 → Python wheel)
accounting-core/   → Shared accounting primitives (Rust library)
accounting-engine-wasm/ → Browser WASM build of accounting-core
mcp_server/        → MCP server exposing Fortnox API (TypeScript, Express)
infra/             → AWS CDK stacks (Python)
lambdas/           → AWS Lambda workers (Python, legacy)
shared/            → Shared Pydantic domain models (Python)
supabase/          → Database migrations (SQL)
wiki/              → LLM-maintained research wiki (see wiki/WIKI.md for schema)
```

**Deployment**: Frontend on AWS CloudFront+S3. Backend (api + worker) and event-processor on Railway (Docker). Database on Supabase (PostgreSQL). Infrastructure via AWS CDK.

See `docs/railway-architecture.md` for the Railway service topology, IDs, private networking, and incident runbook. See `docs/observability.md` for structured-logging fields and Better Stack setup.

## Local Quality Gates

Run `make setup` once to activate git pre-push hooks.

| Command | What it does |
|---------|-------------|
| `npm run dev:staging` | **Recommended local dev** (cross-platform): backend + Vite, env pulled from Railway staging. `make dev-staging` is an equivalent alias. See `docs/local-development.md`. |
| `make fmt` | Auto-fix formatting (ESLint, Ruff, cargo fmt) |
| `make lint` | Run all linters — mirrors CI checks |
| `make check` | Lint + type-check + compile |
| `make test` | Run all test suites |
| `make setup` | Configure git hooks for pre-push linting |
| `make pull-env-staging` | Dump Railway staging env to `.env.staging.local` for ad-hoc tools |

`make dev-staging` requires Railway CLI + `railway login` + `railway link`.
The repo-root `.env` is for offline / no-Railway-CLI fallback only — see
`docs/local-development.md` for the full story.

Module-level `CLAUDE.md` files exist in `frontend/`, `backend/`, `event-processor/`, `supabase/`, and `accounting-core/` with hyperlocal conventions.

Review checks in `.agents/checks/` define what to verify for multi-tenancy, SQL migrations, API contracts, and accounting invariants.

## Essential Commands

### Frontend (from repo root)
```bash
npm run dev              # Vite dev server on :8080, proxies /api to :8000
npm run build            # Production build
npm run lint             # ESLint
cd frontend && npx vitest run --passWithNoTests  # Tests (Vitest + jsdom)
```

### Backend
```bash
cd backend
python -m uvicorn app.main:app --reload --port 8000
python -m pytest tests/ -q --tb=short
```

### Rust (accounting-engine)
```bash
cd accounting-engine && maturin build --release   # Build Python wheel
cd accounting-core && cargo test                   # Run unit tests
cd event-processor && cargo build --release        # Build WebSocket server
cargo test                                         # Tests in any Rust package
```

### Database
```bash
supabase db push --db-url <URL> --include-all     # Apply migrations
```

### Docker (full backend stack)
```bash
docker build -t accounting-pipeline .              # Multi-stage: Rust + Python
# Runs event-processor on :8001 + uvicorn on :8000
```

## Key Conventions

### Frontend
- **Page components** are thin wrappers: import a View, wrap in `<MainLayout>`
- **View components** in `components/views/` handle all logic and data fetching
- **UI primitives** from shadcn/ui in `components/ui/` (50+ components)
- **API calls** use raw `fetch` with auth wrappers in `lib/uploadApi.ts`, `lib/bankApi.ts`, etc.
- **State**: React Context for auth/company, TanStack React Query for server state
- **Real-time**: `useRealtimeEvents` hook connects to event-processor WebSocket, auto-invalidates React Query caches
- **Styling**: Tailwind only, `cn()` utility for conditional classes, no CSS modules
- **Path alias**: `@/*` maps to `src/*`
- **TypeScript**: not strict mode (`noImplicitAny: false`, `strictNullChecks: false`)
- **Focus rings**: must reinforce existing border (gray, no offset gap) — never use pink ring or ring-offset-2
- **Design tokens**: CSS variables in `index.css` — primary pink `#ee8fe0`, success green `#b0ee8f`, warning yellow `#eedd8f`
- **Font**: Inter Variable (normal weight 450, semibold 650)

### Backend (Python)
- FastAPI with feature-based module structure (`accounting_entries/`, `agents/`, `bank_matching/`, etc.)
- Async everywhere: `asyncpg` + `SQLAlchemy` async sessions
- Auth via Supabase JWT — `Authorization: Bearer <token>`, company via `X-Company-Id` header
- LLM: Anthropic Claude + Google Gemini (via LangGraph/LangChain)
- Alembic for Python-side migrations (SQLAlchemy models)

### Rust
- `accounting-core`: pure library, no IO — account validation, balance checks, VAT, FX, SIE-4 parsing
- `accounting-engine`: PyO3 wrapper exposing core to Python — built with `maturin`
- `event-processor`: Axum WebSocket server with PostgreSQL LISTEN/NOTIFY + fallback polling
  - Per-company broadcast channels via `DashMap<Uuid, broadcast::Sender>`
  - Debounced aggregation (500ms idle before recompute)
  - JWT validation against Supabase JWKS
- Tests are inline `#[cfg(test)] mod tests {}` — no separate test directories
- Financial math: always `rust_decimal::Decimal`, never `f64` for currency
- Release profile: `lto = true`, `codegen-units = 1`, `strip = true`

### Swedish BAS Accounting
- Account numbers: 4 digits (1000-9999), first digit = class (1=asset, 2=liability, 3=revenue, 4-7=expense, 8=depreciation)
- VAT treatments: `standard_25`, `reduced_12`, `reduced_6`, `reverse_charge`, `export`, `exempt`
- VAT accounts: 2611-2631 output, 2641 input, 2645 reverse charge input
- Ledger entry statuses: `draft`, `posted`, `reversed`
- Voucher series: default 'A', per-company sequential numbering

## Environment Variables

Copy `.env.example` to `.env`. Key variables:

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | Supabase transaction pooler (port 6543) |
| `LISTEN_DATABASE_URL` | Direct connection for LISTEN/NOTIFY (port 5432) |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Admin key (never commit) |
| `ANTHROPIC_API_KEY` | Claude API |
| `GOOGLE_AI_API_KEY` | Gemini API |
| `FORTNOX_CLIENT_ID/SECRET` | Fortnox OAuth |
| `TOKEN_ENCRYPTION_KEY` | Fernet symmetric key |
| `VITE_API_BASE_URL` | Frontend → backend URL |
| `VITE_SUPABASE_URL` | Frontend Supabase URL |
| `VITE_SUPABASE_ANON_KEY` | Frontend Supabase anon key |

## CI/CD

- Per-component workflows under `.github/workflows/`: `backend.yml`, `frontend.yml`, `event-processor.yml`. Each auto-triggers on push to `main` (with path filters) and auto-deploys to **staging** after its test/lint/build gates pass.
- Production deploys require manual `workflow_dispatch` with `environment=production`.
- `.github/workflows/ci.yml` is the unified orchestrator for DB migrations + CDK + cross-service coordination (manual dispatch, prod gates on a matching successful staging run).
- Railway deploys are invoked via the reusable `_deploy-railway.yml` workflow. Railway project/env/service IDs live in repo-level Actions variables (`RAILWAY_PROJECT_ID`, `RAILWAY_ENV_STAGING_ID`, `RAILWAY_ENV_PRODUCTION_ID`, `RAILWAY_SVC_API_ID`, `RAILWAY_SVC_WORKER_ID`, `RAILWAY_SVC_EVENT_PROCESSOR_ID`) — update via `gh variable set`.
- Staging: `accounting-pipeline-main-staging.up.railway.app`
- Production: `accounting-pipeline-main-production.up.railway.app`
- Frontend deployed to CloudFront with runtime config injection (`window.__APP_CONFIG__`).
- Supabase uses persistent "Staging" branch for staging env.

## Database

- PostgreSQL on Supabase with Row-Level Security
- Migrations in `supabase/migrations/` (timestamped SQL files)
- Key tables: `chart_of_accounts`, `fiscal_periods`, `ledger_entries`, `ledger_entry_lines`, `suppliers`, `supplier_invoices`, `dashboard_aggregates`, `change_log`
- `change_log` table drives real-time invalidation (LISTEN/NOTIFY triggers)
- All tables scoped by `company_id` (multi-tenant)

## Testing

- **Frontend**: Vitest + Testing Library (setup ready, few tests written)
- **Backend**: pytest with async fixtures
- **Rust**: `cargo test` — comprehensive unit tests in accounting-core and accounting-engine
- **Smoke tests**: `scripts/local/run_logical_integrity_smoke.sh` — DNS, health checks, auth guards, frontend routes, S3 upload flow
