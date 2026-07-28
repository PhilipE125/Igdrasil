# Accounting Pipeline

AWS-based accounting automation for Swedish BAS accounting.

## Architecture

```
User uploads PDF/JPEG
        │
        ▼
   S3 Bucket ──► SQS ──► Lambda 1 (Tesseract OCR)
                                │
                                ▼
                          SQS ──► Lambda 2 (LLM: structured extraction)
                                        │
                                        ▼
                                  SQS ──► Lambda 3 (LLM: BAS classification)
                                                │
                                                ▼
                                          PostgreSQL (journal entry)
                                                │
                                                ▼
                                     User reviews in frontend
                                                │
                                                ▼
                                     Fortnox API (voucher + attachment)
```

## Project Structure

```
accounting-pipeline/
├── frontend/          # React + Vite + shadcn/ui
├── backend/           # FastAPI on ECS Fargate
├── lambdas/           # AWS Lambda functions
│   ├── document_extractor/
│   ├── text_structurer/
│   └── account_classifier/
├── shared/            # Shared Pydantic domain models
└── infra/             # AWS CDK (Python)
```

## Quick Start

### Local dev (recommended — pulls env from Railway staging, cross-platform)
```bash
# Prereqs (one-time, use your OS package manager):
#   macOS:    brew install node python railway
#   Windows:  winget install OpenJS.NodeJS Python.Python.3.13 && npm install -g @railway/cli
#   Linux:    sudo apt install nodejs npm python3 python3-venv && npm install -g @railway/cli

railway login
railway link              # pick "giving-abundance"
npm install               # installs concurrently
npm run dev:staging       # backend on :8000, Vite on :8080
```
Both processes inherit the same env Railway uses for `staging.igdrasil.se`,
so there's no `.env` to maintain locally. Same `npm run` command works on
macOS, Linux, and Windows (cmd / PowerShell / Git Bash). See
[`docs/local-development.md`](docs/local-development.md) for the full
guide and troubleshooting.

### Local dev (offline / no Railway CLI)
```bash
cp .env.example .env      # then fill in real values
cd backend && python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
make dev-backend          # uvicorn on :8000, sources .env
make dev-frontend         # npm run dev on :8080
```

### Deploy
```bash
cd infra
cdk deploy --all
```
