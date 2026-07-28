# Docs Index

This directory holds non-runtime material for the landing page project.

## Files

- `DEPLOYMENT.md`: how this site ships to production (S3 + CloudFront at
  igdrasil.se) — infrastructure IDs, build and sync commands, rollback. Read
  this before any deploy.

## Folders

- `research/`: inspection notes, behavior analysis, and reverse-engineering findings.
- `design-references/`: screenshots and visual captures used to match or refine the site.
- `planning/`: roadmap, product direction, and other forward-looking notes.
- `reference/`: imported external codebases and brand material kept for comparison only.
- `archive/`: dormant local assets and scratch material that should not affect the running app.

## Working Rule

If a file does not ship with the landing page and does not need to stay at the repository root, it should usually live somewhere under `docs/`.