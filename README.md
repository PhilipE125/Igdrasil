# Igdrasil Landing Page

Marketing site for Igdrasil, built with Next.js 16, React 19, TypeScript, and Tailwind CSS v4.

## Current Hosting

The repository is hosted on GitHub, and the live site currently appears to be served from GitHub Pages behind Cloudflare.

Observed indicators:

- `origin` points to a GitHub repository.
- `CNAME` is set to `igdrasil.se`.
- The live site returns GitHub request headers and Fastly cache headers.
- `www.igdrasil.se` responds directly from `GitHub.com` with a redirect to the apex domain.
- `igdrasil.se` is proxied through Cloudflare.

There is no deployment workflow in this repo today. The only GitHub Action is CI.

## Run Locally

Prerequisites:

- Node.js 24

Commands:

```bash
npm install
npm run dev
```

Quality checks:

```bash
npm run lint
npm run typecheck
npm run build
```

## Repository Structure

This repo can be made much cleaner, but not completely rootless.
The current Next.js, npm, Docker, GitHub Pages, and editor-tool setup still requires a small set of root entrypoints.

Active application surface:

- `src/app/` App Router routes and global layout
- `src/components/` marketing site UI components
- `src/lib/` content, utilities, and legal page loading
- `public/` runtime images, logos, fonts, videos, manifest, and other static assets
- `content/legal/` source markdown for privacy and terms pages
- `.cache/` generated local build output for Next.js and TypeScript
- `docs/research/` research and reverse-engineering notes used during design and planning
- `docs/design-references/` screenshots and visual references for the landing page
- `docs/planning/` roadmap and product-planning notes
- `next.config.ts`, `Dockerfile`, `docker-compose.yml` app build and runtime config

Supporting material kept out of the runtime path:

- `docs/reference/` large reference projects and imported inspiration codebases
- `docs/archive/raw-assets/` original local photos and scratch assets not used by the running app
- `docs/archive/logo-exploration/` raw logo exploration files not used by the running app

Files worth special attention:

- `CNAME` current custom-domain mapping for the GitHub-hosted setup
- `.github/workflows/ci.yml` CI only, no deployment
- `.github/`, `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, and the root tool config folders such as `.claude/`, `.cursor/`, `.continue/`, `.codex/`, and `.gemini/` are editor and agent integration entry points and intentionally stay at the repository root
- `.dockerignore`, `.gitattributes`, `.nvmrc`, `.aider.conf.yml`, `.clinerules`, and similar root dotfiles remain at the root because Docker, Git, Node tooling, and editor agents discover them there by convention
- `content/legal/privacy.md` privacy notice content
- `content/legal/terms.md` terms content
- `docs/README.md` docs index for non-runtime material

Practical root policy for this repo:

- Keep only framework, package-manager, hosting, and tool-discovery entrypoints at the root
- Keep generated artifacts under `.cache/` instead of as loose root files where possible
- Keep authored content, docs, assets, and application code inside `content/`, `docs/`, `public/`, and `src/`

## Deployment Notes

The app currently builds as a standalone Next.js server:

- `next.config.ts` sets `output: "standalone"`
- `Dockerfile` builds and runs the standalone server
- `docker-compose.yml` supports local prod-like and dev containers

That means moving to CloudFront is possible, but there are two different target shapes:

1. Static export behind CloudFront + S3.
2. Containerized or Lambda-based Next.js runtime behind CloudFront.

Because this app uses the App Router and server-rendered legal content loading, the most straightforward migration path is usually a real Next.js runtime rather than plain static hosting, unless you explicitly convert it to a static export.