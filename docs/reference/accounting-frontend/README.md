# Accounting Pipeline Frontend

React + Vite frontend for the `tools.igdrasil.se` webapp.

## Local development

1. Copy environment template:

```sh
cp .env.example .env
```

2. Set `VITE_API_BASE_URL` in `.env`:

- Local backend: `http://localhost:8000/api`
- Deployed backend: your backend API base ending with `/api`

3. Set Supabase values in `.env`:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

4. Install and run:

```sh
npm ci
npm run dev
```

## Production build

```sh
VITE_BASE_PATH=/ npm run build
```

Production and staging deployments now inject API and Supabase settings through `runtime-config.js` at deploy time. That allows the same built frontend bundle to be promoted between environments without rebuilding.

## Upload pipeline integration

Frontend upload flow is fully API-driven:

1. `POST /uploads/presign`
2. `PUT` file to presigned S3 URL
3. `POST /uploads/confirm`

Supported file types: PDF, JPG/JPEG, PNG.

## Deployment

Deployment is handled via repository GitHub Actions workflows:

1. `deploy-frontend-tools.yml` for direct environment-specific frontend deploys.
2. `promote-release.yml` for staging-first release promotion into production.
