# Igdrasil — Full Project Documentation

> **Igdrasil** is a full-stack accounting automation platform for Swedish BAS accounting standards. It processes invoices and receipts, automates journal entries, and integrates with Fortnox. Multi-tenant architecture with `company_id` on all tables.

---

## Table of Contents

1. [Overview](#1-overview)
2. [Architecture](#2-architecture)
3. [Frontend](#3-frontend)
4. [Backend](#4-backend)
5. [Rust Crates](#5-rust-crates)
6. [Infrastructure (AWS CDK)](#6-infrastructure-aws-cdk)
7. [CI/CD Pipelines](#7-cicd-pipelines)
8. [Database & Migrations](#8-database--migrations)
9. [MCP Server](#9-mcp-server)
10. [Lambda Workers](#10-lambda-workers)
11. [Shared Models](#11-shared-models)
12. [Docker & Deployment](#12-docker--deployment)
13. [Environment Variables](#13-environment-variables)
14. [Development Workflow](#14-development-workflow)

---

## 1. Overview

### What It Does

Igdrasil automates the bookkeeping lifecycle for Swedish companies:

1. **Document Ingestion** — Upload invoices/receipts (PDF, JPEG, PNG) via web UI, Gmail sync, or Telegram bot
2. **Text Extraction** — OCR via PyMuPDF (PDF) or Tesseract (images, Swedish + English)
3. **LLM Classification** — Claude or Gemini classifies documents, extracts structured data, and maps to BAS chart of accounts
4. **Journal Entry Creation** — Double-entry bookkeeping entries with VAT handling, FX conversion, and supplier matching
5. **Bank Reconciliation** — Match bank transactions to supplier invoices (OCR fast-path + LLM fallback)
6. **ERP Export** — Sync entries to Fortnox, Visma, Bjorn Lunden, Briox, or Bokio
7. **Regulatory Reporting** — Momsdeklaration (VAT), INK2, NE-bilaga, year-end closing

### Tech Stack Summary

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + TypeScript + shadcn/ui + Tailwind |
| Backend API | FastAPI (Python 3.13, async SQLAlchemy + asyncpg) |
| Accounting Engine | Rust (pure library + PyO3 bindings + WASM) |
| Event Processor | Rust (Axum 0.8, WebSocket, LISTEN/NOTIFY) |
| MCP Server | TypeScript (Express, proxies Fortnox API) |
| Lambda Workers | Python 3.11 (SQS-triggered document processing) |
| Infrastructure | AWS CDK (Python), Railway (Docker), Supabase (PostgreSQL) |
| AI/LLM | Anthropic Claude + Google Gemini (via LangGraph/LangChain) |
| Chat | Tambo AI (@tambo-ai/react) with generative UI components |

### Key Design Principles

- **Multi-tenancy**: Every table scoped by `company_id`, enforced at query level
- **Async-first**: All I/O is async (asyncpg, aiohttp, tokio)
- **Financial math rigor**: `rust_decimal::Decimal` everywhere, never `f64` for currency
- **Swedish compliance**: BAS Kontoplan, SIE-4 file format, Skatteverket VAT rules
- **Real-time**: PostgreSQL LISTEN/NOTIFY → WebSocket → React Query cache invalidation
- **Immutable audit trail**: SHA-256 hash-chained event log for compliance

---

## 2. Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React SPA)                        │
│   CloudFront + S3  │  Vite  │  shadcn/ui  │  WASM accounting-core │
└───────────┬──────────────────────────┬──────────────────────────────┘
            │ REST /api/*              │ WebSocket /ws
            ▼                          ▼
┌───────────────────────┐   ┌────────────────────────┐
│   BACKEND (FastAPI)   │   │ EVENT-PROCESSOR (Axum) │
│   Railway Docker      │   │ Railway Docker sidecar │
│   Port 8000           │   │ Port 8001              │
│                       │   │                        │
│ ┌───────────────────┐ │   │ LISTEN/NOTIFY          │
│ │ accounting-engine │ │   │ Per-company broadcasts  │
│ │ (PyO3 Rust wheel) │ │   │ Dashboard aggregation   │
│ └───────────────────┘ │   └───────────┬────────────┘
└───────────┬───────────┘               │
            │                           │
            ▼                           ▼
┌─────────────────────────────────────────┐
│         SUPABASE (PostgreSQL)           │
│   RLS  │  Migrations  │  Auth (JWT)    │
└─────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────┐
│              AWS SERVICES               │
│  S3 (uploads)  │  SQS (queues)         │
│  Lambda (workers)  │  Secrets Manager   │
│  CloudFront (CDN)  │  Cognito (legacy)  │
│  Bedrock KB (Skatteverket docs)         │
└─────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────┐
│          EXTERNAL INTEGRATIONS          │
│  Fortnox  │  Visma  │  Gmail  │  Telegram │
│  Riksbanken SWEA (FX rates)            │
└─────────────────────────────────────────┘
```

### Directory Structure

```
accounting-pipeline-main/
├── frontend/              → React 18 + Vite SPA (TypeScript, shadcn/ui, Tailwind)
├── backend/               → FastAPI REST API (Python 3.13, async SQLAlchemy + asyncpg)
├── event-processor/       → Real-time WebSocket server (Rust, Axum 0.8)
├── accounting-core/       → Shared accounting primitives (Rust library)
├── accounting-engine/     → PyO3 Python bindings for accounting-core (Rust → .whl)
├── accounting-engine-wasm/→ WASM browser build of accounting-core
├── mcp_server/            → MCP server exposing Fortnox API (TypeScript, Express)
├── infra/                 → AWS CDK stacks (Python)
├── lambdas/               → AWS Lambda workers (Python, SQS-triggered)
├── shared/                → Shared Pydantic domain models (Python)
├── supabase/              → Database migrations (SQL)
├── scripts/               → CI/CD, local dev, and git hook scripts
├── wiki/                  → LLM-maintained research wiki
├── .github/workflows/     → GitHub Actions CI/CD pipelines
├── Dockerfile             → Multi-stage build (Rust + Python)
├── Makefile               → Quality gate commands
└── railway.toml           → Railway deployment config
```

---

## 3. Frontend

### 3.1 Routing & Pages

All routes except `/auth` and `/onboarding` are wrapped with `<ProtectedRoute>`. React Router v6 with BrowserRouter.

| Path | View Component | Purpose |
|------|---------------|---------|
| `/` | DashboardView | KPI metrics, status cards, activity feed |
| `/auth` | Auth | Login/signup (unauthenticated) |
| `/onboarding` | OnboardingWizard | Company setup wizard (first-time users) |
| `/accounting/automations` | AccountingAutomationsView | Pipeline run history, stage breakdown |
| `/accounting/automations/review` | BookkeepingReviewView | Kanban board for entry review |
| `/accounting/customers` | AccountingCustomersView | Customer list with invoice counts |
| `/accounting/suppliers` | AccountingSuppliersView | Supplier list with invoice totals |
| `/accounting/employees` | AccountingEmployeesView | Employee & salary tracking |
| `/accounting/ledger` | AccountingLedgerView | Trial balance table |
| `/automations/pipeline` | PipelineBuilderView | Visual pipeline flow editor (XYFlow) |
| `/automations/bank-matching` | BankMatchingView | Bank transaction reconciliation |
| `/bank-transactions` | BankTransactionsView | Bank import & statement management |
| `/reports/financial` | FinancialPositionView | Balance sheet, income statement, trial balance |
| `/reports/regulatory` | RegulatoryView | Momsdeklaration, INK2, NE-bilaga, year-end |
| `/reports/custom` | AnalyticsView | Custom analytics (Tambo chat) |
| `/files` | FileArchiveView | Document archive with tree view |
| `/audit-trail` | AuditTrailView | Change log and compliance tracking |
| `/time-tracking` | TimeTrackingView | Time entry & invoice generation |
| `/settings/*` | SettingsView (nested) | Company, user, integrations, API keys, automations |

### 3.2 State Management

#### AuthContext
- **State**: `user`, `session`, `profile`, `loading`
- **Methods**: `signIn`, `signUp`, `signInWithGoogle`, `signOut`, `updateProfile`, `refreshProfile`
- **Implementation**: Supabase auth with `onAuthStateChange` listener, localStorage session restoration

#### CompanyContext
- **State**: `companies[]`, `activeCompany`, `loadingCompanies`
- **Methods**: `setActiveCompany`, `createCompany`, `refreshCompanies`
- **Key feature**: Persistent company ID via `X-Company-Id` header on all API calls

#### FileStoreContext
- **State**: `files[]`, `processing`, `processQueue[]`, `loadingFiles`, `focusFileId`
- **Methods**: `addFiles`, `deleteFile`, `updateFile`, `refreshFiles`
- **Details**: 10-minute processing timeout detection, deduplicates concurrent refresh requests

#### TimerContext
- **State**: `runningEntry`, `elapsedSeconds`, `isLoading`
- **Methods**: `startTracking`, `stopTracking`, `refresh`
- **Details**: 1-second UI tick, 60-second server sync

#### RealtimeContext
- Establishes WebSocket connection to event-processor
- `useRealtimeEvents()` hook manages lifecycle

### 3.3 Real-Time Invalidation

The `useRealtimeEvents` hook connects to the event-processor WebSocket server and maps database table changes to React Query cache keys:

```
documents          → ["pipeline-documents"], ["documents"], ["dashboard-summary"]
pipeline_runs      → ["pipeline-runs"]
ledger_entries     → ["ledger-entries"], ["pipeline-documents"], ["dashboard-summary"]
bank_transaction_matches → ["bank-matches"]
```

- **Auth**: Sends `{ type: "auth", token }` on connect
- **Keepalive**: Ping/pong every 25 seconds
- **Reconnection**: Exponential backoff (1s → 2s → 4s → ... → 30s max)
- **Company-scoped**: Prevents cross-company refetches

### 3.4 API Clients

#### uploadApi.ts — Main Backend Client
Authenticated request wrapper adding `Authorization: Bearer` and `X-Company-Id` headers.

**Key endpoints**:
- `/upload/presign` → presigned S3 URL
- `/documents` → list/get/delete documents
- `/accounting-entries` → journal entries
- `/accounting-entries/review` → entries awaiting approval
- `/fortnox/status` → integration status
- `/bank-matches` → bank transaction reconciliation

#### bankApi.ts — Bank Transactions
- `/bank-transactions/accounts`, `/bank-transactions/imports`, `/bank-transactions/import`

#### employeeApi.ts — Payroll & Time
- `/employees`, `/time-entries`, `/invoices/create-from-time-entries`

#### timeTrackingApi.ts — Time Tracking
- `/time-tracking/current`, `/time-tracking/start`, `/time-tracking/stop`, `/time-tracking/parse-nl`

#### accounting-engine.ts — WASM Client
Lazy-loads the ~130KB WASM binary on first call. Provides sync functions:
- `validateBalanceSync(lines)` — check debit = credit
- `convertAmountSync(amount, rate)` — FX conversion to SEK
- `extractVatAmountSync(total, treatment)` — VAT extraction
- `computeTrialBalanceSync()`, `computeIncomeStatementSync()`, `computeBalanceSheetSync()`
- `computeMomsdeklarationSync()`, `computeYearEndSync()`, `computeRevaluationSync()`
- `classifyVatTreatmentSync(countryCode, vatRate)`
- `getSemanticTypeSync(accountNumber)`

### 3.5 Tambo AI Chat Integration

**TamboProviderWrapper** connects to the MCP HTTP endpoint with auth headers and company context:

```tsx
<TamboProvider
  apiKey={VITE_TAMBO_API_KEY}
  components={TAMBO_COMPONENT_REGISTRY}
  mcpServers={[{ name: "Ledger + Skatteverket", url: "/api/mcp/fortnox", ... }]}
  contextHelpers={{ company: () => `Active company: ${name}...` }}
/>
```

**Generative UI Components (18 total)**:
- Charts: BarChart, LineChart, PieChart, StackedAreaChart, WaterfallChart, CashFlowTimeline
- Tables: DataTable, InvoiceTable, AccountLedger, VATBreakdown, BudgetVariance, SupplierScorecard
- KPI: KpiCard, DecisionTree, TaxRuleCard, AuditTrail, QueryResult

**ChatAssistantView features**: Thread history sidebar, suggested prompts, file upload to pipeline, voice input, markdown rendering with citation extraction, agent thinking visualization.

### 3.6 Layout & Navigation

**MainLayout**: Top bar (breadcrumb + global search + chat toggle) + sidebar (company switcher + nav menu + user menu) + content area.

**AppSidebar nav groups**:
- **Platform**: Dashboard, Accounting (submenu: Automations, Review, Customers, Suppliers, Employees, Ledger)
- **Data**: Time Tracking, File Archive, Bank Transactions, Bank Matching, Reports (submenu: Financial, Regulatory, Custom), Audit Trail

### 3.7 UI Component Library

All shadcn/ui primitives in `components/ui/`:
- **Form**: button, input, label, textarea, checkbox, radio-group, select, combobox, form (react-hook-form)
- **Display**: card, badge, alert, avatar, skeleton, progress, chart (recharts)
- **Layout**: sidebar, drawer, sheet, dialog, popover, tooltip, dropdown-menu, accordion, tabs, separator
- **Data**: table, pagination, breadcrumb
- **Special**: sonner (toast), calendar, carousel, input-otp
- **Custom**: side-panel, table-filter-bar, inline-table-assistant

**Design tokens** (CSS variables in index.css):
- Primary: `#ee8fe0` (pink)
- Success: `#b0ee8f` (green)
- Warning: `#eedd8f` (yellow)
- Border: `#bbbbbb`
- Font: Inter Variable (weight 450 normal, 650 semibold)
- Focus rings: reinforce existing border (gray, no offset gap)

### 3.8 Build Configuration

**Vite** (`vite.config.ts`):
- Plugins: `vite-plugin-wasm`, `vite-plugin-top-level-await`, `@vitejs/plugin-react-swc`
- Dev proxy: `/api/*` → `http://localhost:8000`
- Base path: configurable via `VITE_BASE_PATH`

**TypeScript**: Not strict (`noImplicitAny: false`, `strictNullChecks: false`). Path alias `@/*` → `src/*`.

**Tailwind**: `tailwindcss-animate`, `@tailwindcss/typography` plugins. Custom font sizes (xs=0.6875rem, base=0.8125rem).

**Key dependencies**: react@18.3, react-router-dom@6.30, @tanstack/react-query@5.83, @tambo-ai/react@1.2.4, @xyflow/react@12.10, recharts, zod, react-markdown, sonner.

---

## 4. Backend

### 4.1 Entry Point (main.py)

- **Lifespan hooks**: Database table creation (dev), time tracking schema init, email sync scheduler start, SQS/encryption key validation
- **CORS**: Origins from `FRONTEND_URL` env (comma-separated), supports `X-Company-Id`, `X-MCP-API-Key` headers
- **Health**: `GET /` (service info), `GET /api/health` (DB connectivity check)

### 4.2 API Routes (24 Routers)

All routes prefixed with `/api`.

| Module | Prefix | Purpose |
|--------|--------|---------|
| `uploads` | `/uploads` | Document upload (presigned S3 URLs) |
| `documents` | `/documents` | List, view, delete source documents |
| `pipeline` | `/pipeline` | Pipeline run monitoring, rerun, graph topology |
| `bank-matching` | `/bank-matching` | Bank transaction matching & receipt reconciliation |
| `bank-transactions` | `/bank-transactions` | Import and list bank transactions |
| `accounting-entries` | `/accounting-entries` | Create, update, post, reverse, correct entries |
| `accounting-hub` | `/accounting-hub` | Customers, suppliers, invoices workspace |
| `ledger-entries` | `/ledger-entries` | Ledger-first operator APIs |
| `customer-invoices` | `/customer-invoices` | AR lifecycle (draft → issued → paid → credited) |
| `fortnox` | `/integrations/fortnox` | Fortnox OAuth2 connect/disconnect |
| `visma` | `/integrations/visma` | Visma eAccounting integration |
| `sync` | `/sync` | Fortnox ↔ local ledger synchronization |
| `companies` | `/companies` | Company CRUD + member management |
| `users` | `/users` | User profiles, deletion, data export |
| `agents` | `/agent` | Machine-readable capability manifest |
| `mcp` | `/mcp` | MCP HTTP server for Fortnox tools |
| `audit` | `/audit` | Immutable change log |
| `reports` | `/reports` | Income statement, balance sheet, cash flow |
| `analytics` | `/analytics` | KPI dashboard, trends |
| `time_tracking` | `/time-tracking` | Time entries, timer, NL parsing |
| `employees` | `/employees` | Employee master, wage periods |
| `salary` | `/salary` | Salary computation, employer declarations |
| `telegram` | `/telegram` | Telegram bot setup + webhook |
| `gmail` | `/gmail` | Gmail sync config + OAuth |

**Additional routers**: `card_rules`, `settings`, `dashboard`, `usage`, `skv_kb`, `sie`, `fiscal_periods`, `realtime`, `staged_operations`, `bjornlunden`, `bokio`, `briox`, `fortnox_proxy`.

### 4.3 Key Endpoint Details

#### Upload Flow
```
POST /api/uploads/presign → { process_id, presigned_url, s3_key }
  ↓ (frontend uploads to S3)
POST /api/uploads/confirm → file hash dedup check
  ↓ (user clicks "Run")
POST /api/pipeline/rerun/{document_id} → enqueue to pipeline
```

#### Ledger Entry Lifecycle
```
POST   /api/accounting-entries           → Create draft entry
GET    /api/ledger-entries/{id}          → View entry with lines
PATCH  /api/ledger-entries/{id}/draft    → Update draft
POST   /api/ledger-entries/{id}/post     → Post (creates Fortnox voucher)
POST   /api/ledger-entries/{id}/reverse  → Create reversal entry
POST   /api/ledger-entries/{id}/correct  → Create correction entry
GET    /api/ledger-entries/{id}/chain    → Reversal/correction chain
```

#### Customer Invoice Lifecycle
```
POST   /api/customer-invoices           → Create draft
PATCH  /api/customer-invoices/{id}      → Update draft
POST   /api/customer-invoices/{id}/issue  → Issue (create GL entry)
POST   /api/customer-invoices/{id}/send   → Email delivery
POST   /api/customer-invoices/{id}/settle → Record payment
POST   /api/customer-invoices/{id}/credit → Create credit note
```

#### Bank Matching
```
GET    /api/bank-matching/candidates          → Find unmatched invoices
POST   /api/bank-matching/run                 → Run OCR + LLM matching
POST   /api/bank-matching/receipt-candidates  → Find transactions for invoice
POST   /api/bank-matching/receipt-approval    → Approve match + create journal
POST   /api/bank-matching/manual-match        → Manual link
POST   /api/bank-matching/unmatch             → Reject match
```

#### Fortnox Sync
```
POST   /api/sync/fortnox/start   → Pull suppliers, accounts, projects, cost centers
GET    /api/sync/fortnox/status   → Sync status
GET    /api/sync/suppliers        → Synced suppliers
GET    /api/sync/accounts         → Synced accounts
GET    /api/sync/cost-centers     → Synced cost centers
GET    /api/sync/projects         → Synced projects
```

### 4.4 Authentication & Multi-Tenancy

1. Frontend obtains JWT from Supabase (or legacy Cognito)
2. JWT sent in `Authorization: Bearer <token>` header
3. Backend verifies JWT signature (cached JWKS from Supabase)
4. Company extracted from `X-Company-Id` header, membership verified
5. Every DB query filtered by `company_id`

**Core dependencies** (FastAPI Depends):
```python
get_current_user    → UserDB
get_current_company → CompanyDB (verifies membership)
get_db              → AsyncSession
get_settings        → Settings
```

### 4.5 Pipeline System (LangGraph)

The document processing pipeline uses LangGraph for agentic LLM loops.

#### Pipeline State
```python
# Input
user_id, process_id, company_id, s3_bucket, s3_key, file_type, llm_provider

# Extraction
extracted_text, content_hash (SHA256 dedup)

# Classification
document_type ("invoice" | "receipt" | "unknown"), type_confidence

# Structuring
structured_invoice (supplier, amounts, VAT, dates, line items)

# Matching
supplier_id, supplier_history, card_rule (receipts)

# Output
classification (double-entry voucher), ledger_entry_id
fx_currency, fx_rate, fx_original_amount, fx_converted_sek
```

#### Pipeline Nodes (10)

| Node | Purpose |
|------|---------|
| `extract_text` | Download S3 → PyMuPDF (PDF) or Tesseract OCR (images) |
| `check_duplicate` | SHA-256 content hash dedup |
| `classify_type` | LLM: invoice / receipt / unknown |
| `structure_text` | LLM: extract supplier, dates, amounts, VAT, line items |
| `flag_document` | Unknown type → manual review |
| `lookup_supplier` | DB: find supplier by name/org_number, get invoice history |
| `lookup_card_rules` | Receipts: match card_last_four to expense account rules |
| `classify_accounts` | LLM with tools: map to BAS accounts, produce double-entry voucher |
| `validate_classification` | Check balance, route to fallback if needed |
| `create_journal` | Create supplier_invoices + ledger_entries records |

#### Routing Logic
```
extract → check_duplicate → classify_type
  ├── unknown → flag_document (END)
  └── invoice/receipt → structure_text → lookup_supplier
        ├── receipt → lookup_card_rules → classify_accounts
        └── invoice → classify_accounts
              → validate_classification
                ├── balanced → create_journal (END)
                └── error → fallback_classify → create_journal
```

#### LLM Tools (agent toolbox)
- `search_bas_accounts(query, account_class)` — Search Swedish chart of accounts
- `search_supplier_history(supplier_name, org_number)` — Get previous invoice patterns
- `search_classification_examples(supplier_name, document_type)` — Proven classification templates

### 4.6 Integration Adapters

| Adapter | Purpose |
|---------|---------|
| `FortnoxAdapter` | Export vouchers, invoices, payments via OAuth2 |
| `VismaAdapter` | Visma eAccounting export |
| `BjornLundenAdapter` | Bjorn Lunden export |
| `BrioxAdapter` | Briox export |
| `BokioAdapter` | Bokio export |

All implement `BaseAdapter`: `validate_entry()`, `export_entry()`, `fetch_accounts()`.

Fortnox supports both regular OAuth and bureau (byrå) service account mode with `fortnox_client_tenant_id`.

### 4.7 Staged Operations & Approval Workflow

High-risk operations (post, reverse, correct entries) can be staged for approval:

```
POST /api/staged-operations        → Create pending operation
GET  /api/staged-operations/{id}   → View details
POST /api/staged-operations/{id}/approve → Execute
POST /api/staged-operations/{id}/reject  → Reject with reason
```

### 4.8 Audit Trail

Immutable, hash-chained event log (SHA-256):
- Fields: action, entity_type, entity_id, previous_state, details, actor_type, event_type
- Hash chain: `prev_hash || "|" || event_json`
- Genesis hash: `0000...0000` (64 zeros)
- Tamper detection via chain verification

### 4.9 Telegram Bot

Per-company bot integration:
- `POST /api/telegram/setup` — Register bot
- Webhook receives photos → triggers pipeline
- Query balances, P&L via chat
- Approve/reject staged operations

---

## 5. Rust Crates

### 5.1 accounting-core (Pure Library)

Platform-agnostic accounting primitives. No IO, no side effects.

**Dependencies**: `rust_decimal`, `serde`, `serde_json`

| Module | Purpose |
|--------|---------|
| `account.rs` | BAS Kontoplan validation, account classes (1-8) |
| `account_types.rs` | Semantic classification (40+ types: REVENUE, ASSET, EXPENSE...) |
| `balance.rs` | Voucher line balance validation & auto-correction |
| `classify_vat.rs` | EU VAT treatment classification (standard_25, reduced_12/6, reverse_charge, export, exempt) |
| `decimal.rs` | Financial rounding (half-up strategy) |
| `fx.rs` | Foreign currency ↔ SEK conversion |
| `vat.rs` | VAT calculations, line generation (input/output/reverse charge) |
| `sie.rs` | SIE-4 file parsing & generation (UTF-8, CP437, Windows-1252 encoding) |
| `moms.rs` | Swedish Momsdeklaration (SKV 4700) computation |
| `reports.rs` | Trial balance, income statement, balance sheet, general ledger |
| `revaluation.rs` | FX revaluation at period-end |
| `year_end.rs` | Year-end closing entries |
| `ink2.rs` | INK2 tax form (small business) |
| `ne_bilaga.rs` | NE-bilaga report |
| `employer.rs` | Swedish employer contribution calculations |
| `reconciliation.rs` | Supplier account reconciliation |

**Key invariants**:
- Account numbers: 4 digits (1000-9999), first digit = class
- VAT accounts: 2611-2631 output, 2641 input, 2645 reverse charge input
- All math uses `rust_decimal::Decimal`, never `f64`

### 5.2 accounting-engine (PyO3 Bindings)

Python extension module built with `maturin`. Exposes all accounting-core functions to Python.

**Additional dependencies**: `pyo3` (abi3-py311), `csv`, `ring` (SHA-256), `hex`

**Extra functionality beyond core**:
- **CSV bank parsing**: Supports Juni, Lunar, Nordea, SEB, Swedbank, Handelsbanken, Skatteverket formats
- **Audit hash chain**: SHA-256 chain computation and verification
- **Dedup hashing**: Transaction deduplication via content hash

**PyO3 types**:
```rust
EntryLine { account_number, account_name, debit, credit, description, cost_center, project }
VatLine { account_number, account_name, debit, credit, description }
BalanceResult { is_valid, total_debit, total_credit, difference }
FxConversion { ... }
```

**Build**: `maturin build --release` → produces `accounting_engine-*.whl`

### 5.3 accounting-engine-wasm (Browser Build)

WASM compilation of accounting-core for real-time browser calculations.

**Dependencies**: `wasm-bindgen`, `serde-wasm-bindgen`, `js-sys`, `sha2`

**Exported WASM functions** (20+):
- `validateBalance(lines_json)` → balance check
- `convertAmount(amount, rate)` → FX conversion
- `extractVatAmount(total, treatment)` → VAT calculation
- `round2(value)` → financial rounding
- `computeTrialBalance(accounts_json)` → report
- `computeIncomeStatement(accounts_json)` → P&L
- `computeBalanceSheet(accounts_json, period_result)` → B/S
- `computeMomsdeklaration(balances_json)` → VAT declaration
- `computeYearEnd(balances_json)` → closing entries
- `computeRevaluation(positions_json, closing_rate)` → FX revaluation
- `classifyVatTreatment(country_code, vat_rate)` → classification
- `hashFile(data)` → SHA-256

**Build profile**: `opt-level = "s"`, `lto = true` (minimize WASM binary size)

### 5.4 event-processor (WebSocket Server)

Real-time event streaming from PostgreSQL to connected clients.

**Dependencies**: `axum` (0.8, ws), `tokio`, `tokio-postgres`, `deadpool-postgres`, `dashmap`, `jsonwebtoken`, `reqwest`

**Architecture**:

```
PostgreSQL NOTIFY data_change
  ↓
listener.rs (async task, 30s fallback poll)
  ↓
Parses company_id + type from payload
  ↓
ChannelRegistry.broadcast(company_id, msg)   ← DashMap<Uuid, broadcast::Sender>
  ↓
All subscribed WebSocket clients receive invalidation
```

**Key modules**:
| Module | Purpose |
|--------|---------|
| `main.rs` | Server init, 2-second polling loop, health endpoint |
| `websocket.rs` | Per-client WS handler, merges company broadcasts into mpsc |
| `channels.rs` | Per-company broadcast registry (DashMap, 256-capacity, lazy creation) |
| `listener.rs` | PostgreSQL LISTEN/NOTIFY + 30s fallback poll |
| `aggregator.rs` | Dashboard recomputation (500ms debounce, marks dirty companies) |
| `auth.rs` | JWT validation against Supabase JWKS (5-min cache) |
| `config.rs` | Environment config (DATABASE_URL, LISTEN_DATABASE_URL, SUPABASE_URL) |

**WebSocket flow**:
1. Client connects to `/ws`
2. Sends `{ type: "auth", token }` or connects with `?token=...`
3. JWT validated → extract user_id → query user's companies
4. Subscribe to all company broadcast channels
5. Receive invalidation messages, forward to client
6. If lagged (>256 messages), disconnect

**Dashboard aggregation**: Every 500ms, recomputes revenue/expenses/net_profit/document_count for dirty companies and UPSERTs into `dashboard_aggregates`.

**Build profile**: `lto = "thin"`, `codegen-units = 8`, `strip = true`

---

## 6. Infrastructure (AWS CDK)

8 CDK stacks deployed via `infra/app.py`:

### Stack 1: QueueStack
- SQS queues: extraction, structuring, classification, agent
- Dead-letter queues with 14-day retention
- CloudWatch alarms for queue depth

### Stack 2: StorageStack
- S3 `uploads-{env}` bucket (versioned, Glacier lifecycle after 90 days, CORS)
- S3 `logs-{env}` bucket (CloudFront/ALB logs)

### Stack 3: SecretsStack
- Secrets Manager: DATABASE_URL, Google AI API key
- SSM Parameter Store for Lambda env injection

### Stack 4: AuthStack
- Cognito User Pool (email sign-in, optional MFA)
- Access token: 1 hour, refresh: 30 days

### Stack 5: ECRStack
- Private ECR repos for Lambda Docker images

### Stack 6: PipelineWorkersStack
- **ExtractorFunction**: 2048 MB, 300s timeout, SQS trigger
- **StructurerFunction**: 1536 MB, 180s timeout
- **ClassifierFunction**: 1536 MB, 180s timeout
- **AgentPipelineFunction**: Docker-based (ECR), LangGraph
- Reserved concurrency: 10/20/20

### Stack 7: FrontendStack
- S3 bucket for React build
- CloudFront distribution with OAI
- Runtime config injection (`window.__APP_CONFIG__`)

### Stack 8: McpServerStack
- Lambda Function URL (Node.js 20.x, 512 MB)
- Proxies Fortnox API calls

### Optional: KnowledgeBaseStack
- Aurora Serverless v2 (pgvector, min ACU = 0.0)
- Bedrock Knowledge Base (Titan Embed v2, 1024-dim)
- S3 bucket for Skatteverket tax documents

---

## 7. CI/CD Pipelines

### promote.yml (Main Pipeline)

**Trigger**: Push to `main` or manual dispatch

**Stages**:
1. `set-env` — determine target environment (staging/production)
2. `changes` — path-filter to detect what changed
3. `build` — lint (ruff, eslint, cargo clippy), test, build Rust wheels
4. `test-backend` — pytest
5. `test-frontend` — vitest
6. `build-docker` — multi-stage Docker → ECR
7. `deploy-infra` — CDK synth/deploy
8. `deploy-backend` — Railway redeploy
9. `deploy-frontend` — S3 upload + CloudFront invalidation
10. `run-smoke-tests` — health endpoint verification

### Other Workflows

| Workflow | Purpose |
|----------|---------|
| `promote-release.yml` | Staging → Production promotion (requires staging SHA) |
| `promote-production.yml` | Production-only deploy (manual, serialized) |
| `deploy-frontend-tools.yml` | Frontend-only deploy on frontend/ changes |
| `smoke-only.yml` | Manual smoke test runner (no deployment) |

### Deployment Targets

| Component | Platform | Details |
|-----------|----------|---------|
| Frontend | AWS CloudFront + S3 | Static SPA with runtime config injection |
| Backend + Event Processor | Railway (Docker) | Dual-process: FastAPI (:8000) + event-processor (:8001) |
| Lambda Workers | AWS Lambda | SQS-triggered, Python 3.11 |
| MCP Server | AWS Lambda Function URL | Node.js 20.x |
| Database | Supabase | PostgreSQL with RLS, staging branch support |

---

## 8. Database & Migrations

### 8.1 Database Architecture

PostgreSQL on Supabase with Row-Level Security. 49 migration files in `supabase/migrations/`.

### 8.2 Tables (47 Total)

#### Companies & Users
| Table | Purpose |
|-------|---------|
| `CompanyDB` | Multi-tenant root (org_number, fiscal year, Fortnox metadata) |
| `UserDB` | Auth identity (preferred LLM provider) |
| `CompanyMembershipDB` | Many-to-many company/user |
| `DashboardAggregateDB` | Pre-computed KPIs |

#### Documents & Processing
| Table | Purpose |
|-------|---------|
| `DocumentDB` | Uploaded files (S3 key, status: UPLOADED→EXTRACTING→CLASSIFIED→MATCHED) |
| `PipelineRunDB` | LangGraph execution tracking (node_history, token usage) |

#### Accounting Core
| Table | Purpose |
|-------|---------|
| `BasKontoplanDB` | Swedish BAS chart of accounts (read-only, ~1800 accounts) |
| `ChartOfAccountsDB` | Per-company account overrides |
| `FiscalPeriodDB` | Period state (locked, closed, opening balances) |
| `LedgerEntryDB` | Double-entry journal (voucher_number, status: draft→posted→reversed) |
| `LedgerEntryLineDB` | Voucher lines (debit/credit, VAT code, cost center, project) |
| `AccountingEntryLinkDB` | Cross-entry relationships (reversal, correction chains) |

#### Customers & Invoicing (AR)
| Table | Purpose |
|-------|---------|
| `CustomerDB` | Billing parties |
| `CustomerInvoiceDB` | AR invoices (status: draft→issued→paid, FX rates) |
| `CustomerInvoiceItemDB` | Line items (qty, unit_price, VAT) |
| `CustomerInvoicePaymentDB` | Payment tracking |
| `CustomerInvoiceDeliveryDB` | Email delivery tracking |
| `CustomerInvoiceReminderDB` | Payment reminders |

#### Suppliers & Payables (AP)
| Table | Purpose |
|-------|---------|
| `SupplierDB` | AP parties (bank details, default expense account) |
| `SupplierInvoiceDB` | Invoices received (status, VAT treatment) |
| `SupplierInvoicePaymentQueueDB` | Payment scheduling |

#### Bank & Reconciliation
| Table | Purpose |
|-------|---------|
| `BankAccountDB` | Account metadata (IBAN, currency, ledger account) |
| `BankTransactionImportDB` | Import batch metadata |
| `BankTransactionDB` | Transaction detail (dedup_hash, reconciliation_status) |
| `BankTransactionMatchDB` | Matched invoices (confidence, method) |

#### Classification
| Table | Purpose |
|-------|---------|
| `CardRuleDB` | Receipt classification rules (card_last_four → account) |
| `ClassificationExampleDB` | Verified classification patterns for few-shot prompting |

#### Integrations
| Table | Purpose |
|-------|---------|
| `IntegrationCredentialDB` | Encrypted OAuth tokens |
| `FortnoxSyncStatusDB` | Sync metadata |
| `FortnoxProjectDB` / `FortnoxCostCenterDB` | Cached Fortnox entities |
| `FortnoxFinancialYearDB` / `FortnoxLockedPeriodDB` | Fiscal config |

#### HR & Time Tracking
| Table | Purpose |
|-------|---------|
| `EmployeeDB` | Employee master (salary, tax ID) |
| `WagePeriodDB` | Salary period |
| `EmployerDeclarationDB` | SIE-K2 declarations |
| `TimeEntryDB` | Time tracking (hours, project, cost center) |

#### Messaging & Email
| Table | Purpose |
|-------|---------|
| `EmailSyncConfigDB` | Gmail sync config (encrypted token) |
| `EmailMessageDB` | Synced messages |
| `EmailAttachmentDB` | Email attachments |
| `TelegramBotConfigDB` | Per-company bot config |
| `TelegramUserLinkDB` | User ↔ Telegram chat linking |
| `TelegramLinkCodeDB` | Time-limited linking codes |

#### Audit & Compliance
| Table | Purpose |
|-------|---------|
| `AuditLogDB` | Immutable hash-chained event log |
| `LlmUsageLogDB` | Token tracking per action/model |
| `StagedOperationDB` | Approval workflow |
| `SavedAnalyticsQueryDB` | Custom saved reports |

### 8.3 Key Migration Highlights

| Migration | What It Does |
|-----------|-------------|
| `20260215000001` | Initial schema: users, companies, documents, invoices, entries |
| `20260320000000` | Ledger schema v2: transaction-based accounting with lines and balances |
| `20260325000003` | BAS account plan import (243 KB SQL, ~1800 accounts) |
| `20260324000001` | Audit trail v2: event sourcing with hash chain |
| `20260325000001` | Realtime: LISTEN/NOTIFY triggers on change_log |
| `20260328000001` | Employees module: payroll, tax IDs |
| `20260329000001` | Year-end closing, ledger validation |

### 8.4 Real-Time Change Propagation

```sql
-- Trigger on change_log inserts
NOTIFY data_change, '{"company_id": "...", "table": "ledger_entries", ...}'
```

The `change_log` table records all entity mutations. PostgreSQL triggers fire NOTIFY on insert, which the event-processor picks up and broadcasts to WebSocket clients.

---

## 9. MCP Server

**Location**: `mcp_server/src/`

TypeScript Express server exposing Fortnox API as MCP tools. Deployed as AWS Lambda Function URL.

### Authentication
- `X-MCP-API-Key` header required on all requests
- Forwarded to backend for validation

### Tools (60+)

**Vouchers & Accounting**:
- `fortnox_list_vouchers` (series, date range, financial year)
- `fortnox_get_voucher` (series + number)
- `fortnox_list_financial_years`, `fortnox_list_voucher_series`

**Chart of Accounts**:
- `fortnox_list_accounts`, `fortnox_get_account`
- `fortnox_list_cost_centers`, `fortnox_list_projects`

**Invoicing**:
- `fortnox_list_invoices`, `fortnox_get_invoice`
- `fortnox_list_supplier_invoices`, `fortnox_get_supplier_invoice`
- `fortnox_list_offers`

**Master Data**:
- `fortnox_list_customers`, `fortnox_list_suppliers`
- `fortnox_list_articles`, `fortnox_list_contracts`, `fortnox_list_assets`

All tools support pagination (`page`, `limit` max 500) and proxy through the backend at `BACKEND_API_URL/api/integrations/fortnox/proxy`.

---

## 10. Lambda Workers

### Pipeline (SQS + LangGraph)

| Lambda | Trigger | Memory | Timeout | Purpose |
|--------|---------|--------|---------|---------|
| Extractor | `extraction-queue` | 2048 MB | 300s | PDF → text (PyMuPDF) or image → text (Tesseract OCR) |
| Structurer | `structuring-queue` | 1536 MB | 180s | Text → StructuredInvoice (Claude/Gemini LLM) |
| Classifier | `classification-queue` | 1536 MB | 180s | StructuredInvoice → BAS accounts + journal entry |
| Agent | `agent-queue` | Docker | - | Multi-step LangGraph orchestration |

### Lambda Layer
Python dependencies compiled on Lambda AL2023 for glibc compatibility. Includes: boto3, psycopg2, anthropic, google-ai.

---

## 11. Shared Models

**Location**: `shared/models/`

| Model | Purpose |
|-------|---------|
| `StructuredInvoice` | Lambda 2 output: supplier, amounts, VAT, dates, line items |
| `InvoiceLineItem` | Individual invoice line |
| `FortnoxVoucher` / `FortnoxVoucherRow` | Fortnox API voucher format |
| `FortnoxTokens` | OAuth token pair |
| `DocumentStatus` | Status enum for processing pipeline |
| `ProcessingStage` | Pipeline stage enum |
| SQS message schemas | Queue interop between Lambdas |

---

## 12. Docker & Deployment

### Dockerfile (Multi-Stage)

**Stage 1: deps-builder** (rust:1.88-slim)
- Install build tools, maturin
- Pre-compile Rust dependencies (cached layer — no source code)

**Stage 2: rust-builder**
- Copy actual source, build `accounting-engine` wheel + `event-processor` binary

**Stage 3: Final** (python:3.13-slim)
- Install Python deps, Rust wheel
- Copy backend code, shared models, Supabase CA cert
- CMD: `uvicorn app.main:app --host 0.0.0.0 --port 8080`

### Railway Deployment

```toml
[deploy]
startCommand = "EVENT_PORT=${EVENT_PORT:-8001} /usr/local/bin/event-processor &
                exec python -m uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"
healthcheckPath = "/api/health"
healthcheckTimeout = 120
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10
```

Dual-process container: event-processor (WebSocket, port 8001) + FastAPI (REST, port 8000).

### Deployment URLs
- **Staging**: `accounting-pipeline-main-staging.up.railway.app`
- **Production**: `accounting-pipeline-main-production.up.railway.app`
- **Frontend**: CloudFront distribution with S3 origin

---

## 13. Environment Variables

### Core Application
| Variable | Purpose |
|----------|---------|
| `ENVIRONMENT` | `development` / `staging` / `production` |
| `DATABASE_URL` | Supabase transaction pooler (port 6543) |
| `LISTEN_DATABASE_URL` | Direct connection for LISTEN/NOTIFY (port 5432) |

### Auth
| Variable | Purpose |
|----------|---------|
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Admin key (never commit) |
| `TOKEN_ENCRYPTION_KEY` | Fernet key for OAuth token encryption |

### AI/LLM
| Variable | Purpose |
|----------|---------|
| `ANTHROPIC_API_KEY` | Claude API |
| `GOOGLE_AI_API_KEY` | Gemini API |
| `BEDROCK_KB_ID` | Bedrock Knowledge Base (Skatteverket) |

### Integrations
| Variable | Purpose |
|----------|---------|
| `FORTNOX_CLIENT_ID` / `FORTNOX_CLIENT_SECRET` | Fortnox OAuth |
| `FORTNOX_REDIRECT_URI` | OAuth callback URL |
| `VISMA_CLIENT_ID` / `VISMA_CLIENT_SECRET` | Visma eAccounting |
| `GMAIL_CLIENT_ID` / `GMAIL_CLIENT_SECRET` | Gmail sync |
| `RIKSBANKEN_SWEA_PRIMARY_KEY` | Swedish FX rates API |

### AWS
| Variable | Purpose |
|----------|---------|
| `AWS_REGION` | Default: eu-north-1 (Stockholm) |
| `S3_BUCKET_NAME` | Document uploads |
| `SQS_EXTRACTION_QUEUE_URL` | Pipeline queue URLs |

### Frontend (VITE_ prefix)
| Variable | Purpose |
|----------|---------|
| `VITE_API_BASE_URL` | Backend URL (empty for dev proxy) |
| `VITE_SUPABASE_URL` | Supabase URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key |
| `VITE_TAMBO_API_KEY` | Tambo AI chat |

---

## 14. Development Workflow

### Quality Gates

| Command | What It Does |
|---------|-------------|
| `make fmt` | Auto-fix: ESLint (frontend), Ruff (backend/infra), cargo fmt (Rust) |
| `make lint` | Lint all: ESLint, Ruff check, cargo clippy -D warnings |
| `make check` | Lint + TypeScript noEmit + cargo check (all 3 Rust crates) |
| `make test` | All tests: Vitest (frontend), pytest (backend), cargo test (Rust) |
| `make setup` | Configure git pre-push hooks |

### Running Locally

```bash
# Backend (FastAPI on :8000)
cd backend && python -m uvicorn app.main:app --reload --port 8000

# Frontend (Vite on :8080, proxies /api to :8000)
npm run dev

# Rust accounting engine (build wheel)
cd accounting-engine && maturin build --release

# Rust event processor
cd event-processor && cargo build --release

# Run tests
cd backend && python -m pytest tests/ -q --tb=short
cd frontend && npx vitest run --passWithNoTests
cd accounting-core && cargo test
```

### Git Conventions
- Push to `main` triggers CI/CD
- Pre-push hook runs `make lint`
- Staging deploys automatically, production requires manual promotion
- Database migrations: `supabase db push --db-url <URL> --include-all`

### Smoke Tests
```bash
scripts/local/run_logical_integrity_smoke.sh
```
Checks: DNS resolution, health endpoints, auth guards, frontend routes, S3 upload flow.
