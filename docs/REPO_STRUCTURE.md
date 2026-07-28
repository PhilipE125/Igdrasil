# Repository Structure

This file describes what is part of the running landing page and what is reference or archive material.

The goal is a minimal root, not a literally empty one. Some files still need to live at the repository root because Next.js, npm, Docker, GitHub Pages, and editor tooling discover them there by convention.

## Runtime Surface

- `src/app/`: Next.js routes, root layout, and route-level page entry points.
- `src/components/`: reusable marketing-site components.
- `src/lib/`: data models, content definitions, helpers, and legal document loading.
- `src/hooks/`: client-side hooks.
- `src/types/`: TypeScript types.
- `public/`: production static assets loaded by the app.
- `content/legal/`: source documents rendered at `/privacy` and `/terms`.
- `.cache/`: generated Next.js and TypeScript build artifacts.

## Project Docs

- `docs/README.md`: top-level map for all non-runtime documentation.
- `docs/research/`: research notes, inspections, and planning material.
- `docs/design-references/`: screenshots and design captures.
- `docs/planning/`: roadmap and product-planning notes.
- `docs/REPO_STRUCTURE.md`: this map.

## Non-Runtime Material

- `docs/reference/`: large reference codebases and related notes.
- `docs/reference/README.md`: index for imported reference projects.
- `docs/archive/raw-assets/`: local source images and scratch assets that are not used by the live site.
- `docs/archive/logo-exploration/`: unused logo source directories kept for reference.
- `docs/archive/README.md`: index for archived non-runtime material.

## Root-Level Files

Only a small set of root files should matter day-to-day:

- `package.json`: scripts and dependencies.
- `next.config.ts`: Next.js configuration.
- `Dockerfile` and `docker-compose.yml`: container-based run and deploy options.
- `CNAME`: current GitHub custom-domain mapping.
- `README.md`: operational overview.

The root also contains tool-bound integration config that intentionally cannot be moved without breaking those tools:

- `.github/`: CI and Copilot setup.
- `AGENTS.md`, `CLAUDE.md`, and `GEMINI.md`: model-specific instruction entry points.
- `.claude/`, `.cursor/`, `.continue/`, `.codex/`, `.gemini/`, and similar root folders: editor and agent configuration discovered by convention at the repository root.
- `.dockerignore`, `.gitattributes`, `.nvmrc`, `.aider.conf.yml`, `.clinerules`, `.windsurfrules`, and similar root dotfiles: Docker, Git, Node, and editor-agent settings that are discovered from the repository root.

If a file or folder does not fit one of those categories, it should usually live under `docs/`, `content/`, `public/`, or `src/` instead of the repository root.

## Root Reduction Rules

- Prefer generated output in `.cache/` instead of loose root artifacts.
- Prefer `content/` for authored markdown and legal text.
- Prefer `docs/` for planning, research, archive, and reference material.
- Prefer `public/` for runtime static assets.
- Treat the remaining root files as the smallest practical entry surface for the current toolchain.