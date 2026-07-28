# Deployment

This site is a **static export** served from S3 behind CloudFront at
**https://igdrasil.se**. There is no server in production and no deploy
automation — deploys are run by hand from a local checkout.

## Target infrastructure

| | |
|---|---|
| AWS account | `034363017706` (`eu-north-1`) |
| S3 bucket | `accounting-pipeline-landing-page-prod` |
| CloudFront distribution | `E1ZVU6YLXFC8WC` |
| Aliases | `igdrasil.se`, `www.igdrasil.se` (301 → apex) |
| ACM certificate | `arn:aws:acm:us-east-1:034363017706:certificate/b875b4a6-3a7d-4c6e-8863-f2a0d7c2be59` |
| Backup bucket | `igdrasil-landing-prod-backup-034363017706-eu-north-1` (private) |

The bucket and distribution are provisioned by CDK in a **different** repo —
`Igdrasil-AB/igdrasil-accounting`, at `infra/stacks/landing_page_stack.py` with
config in `infra/config/prod.yaml`. Do not recreate them from here. This repo
only supplies the bucket's *contents*.

**DNS needs no changes on deploy.** The distribution already carries both
aliases with a valid certificate. A deploy swaps bucket contents and
invalidates the cache — nothing else.

## Prerequisites

### Use the Homebrew node

`node` on this machine may resolve to a symlink into ChatGPT.app:

```
~/.local/bin/node → /Applications/ChatGPT.app/Contents/Resources/cua_node/bin/node
```

That binary is signed with a Team ID and runs under hardened runtime, so it
**cannot load** Next's native SWC binary (`@next/swc-darwin-arm64`, ad-hoc
signed). Next then silently falls back to WASM bindings, which disables
Turbopack and makes builds 10–20× slower and dramatically more memory hungry —
enough to exhaust RAM and hang the machine.

Always prefix deploy commands:

```bash
export PATH="/opt/homebrew/bin:$PATH"
```

A healthy build compiles in **under 2 seconds**. If it takes 15+ seconds or
prints a `dlopen` / "different Team IDs" warning, you are on the wrong node.

### AWS credentials

Profile `default`, region `eu-north-1`, IAM user `cdk-deployer`. Verify with
`aws sts get-caller-identity`.

## Deploy

```bash
cd /Users/philiperiksson/Igdrasil_Landing_Page
export PATH="/opt/homebrew/bin:$PATH"

# 1. Clean build. The rm is required — see "Why the rm" below.
rm -rf .cache/next && npm run build

# 2. Hashed assets first, cached forever.
aws s3 sync .cache/next/_next s3://accounting-pipeline-landing-page-prod/_next \
  --cache-control "public, max-age=31536000, immutable" --delete

# 3. HTML and public assets, always revalidated.
aws s3 sync .cache/next s3://accounting-pipeline-landing-page-prod \
  --exclude "_next/*" --cache-control "public, max-age=0, must-revalidate" --delete

# 4. Invalidate.
aws cloudfront create-invalidation --distribution-id E1ZVU6YLXFC8WC --paths "/*"
```

Verify the object count in the bucket equals `find .cache/next -type f | wc -l`.

### Why the `rm`

`next.config.ts` sets `distDir: ".cache/next"`, and under `output: "export"`
that directory is *also* where the export lands. If a previous dev server or
build left artifacts there, they get uploaded to production. Always build into
an empty `.cache/next`.

### Why two syncs

Step 2 must run before step 3, and step 3 excludes `_next/*` so the two cache
policies don't overwrite each other.

**Pitfall:** `--exclude` also excludes those paths from `--delete`. Running only
step 3 leaves orphaned `_next/` files from the previous deploy in the bucket
forever. Step 2's own `--delete` is what prunes them — don't drop it.

## Verify

```bash
for u in https://igdrasil.se/ https://igdrasil.se/privacy/ https://igdrasil.se/terms/; do
  curl -s -o /dev/null -w "$u  %{http_code}\n" "$u"
done
curl -s https://igdrasil.se/ | grep -o "<title>[^<]*</title>"
```

## Roll back

Every deploy should be preceded by a backup:

```bash
aws s3 sync s3://accounting-pipeline-landing-page-prod \
            s3://igdrasil-landing-prod-backup-034363017706-eu-north-1/$(date +%F)/
```

To restore a previous deploy:

```bash
aws s3 sync s3://igdrasil-landing-prod-backup-034363017706-eu-north-1/<DATE>/ \
            s3://accounting-pipeline-landing-page-prod --delete
aws cloudfront create-invalidation --distribution-id E1ZVU6YLXFC8WC --paths "/*"
```

Existing backups: `2026-07-28/` — the multi-page site that served igdrasil.se
until 2026-07-28 (307 objects, 22,675,290 bytes).

## Routing

Static export runs with `trailingSlash: true`, so every route is
`<route>/index.html`. A CloudFront Function on the distribution
(`eu-north-1AccountingPipelieRewriteFunctionDE441F7F`, viewer-request) rewrites:

- `/` → `/index.html`
- `/foo/` → `/foo/index.html`
- `/foo` (no dot) → `/foo/index.html`

Adding a route needs no CloudFront change. Adding a **redirect** does — edit
that function.

## Known state

- This site currently serves 3 routes: `/`, `/privacy/`, `/terms/`.
- The site that served igdrasil.se before 2026-07-28 had many more —
  `/about/`, `/glossary/`, `/knowledge-base/`, `/how-to-use/`, and a Swedish
  `/sv/` tree. **Those URLs now return 404** and may still be indexed or linked
  externally. If they need to resolve, add redirects to the CloudFront Function
  above; the old content is in the backup bucket.
- That older site is a **separate project**, not this repo:
  `Igdrasil-AB/igdrasil-accounting` at `landing page/`. It shares component
  names (`Hero.tsx`, `FinalCTA.tsx`, `lib/content.ts`) with this repo, so the
  two are easy to confuse. Changes made here do **not** appear there.

## Preview distribution

An unaliased CloudFront distribution exists for previewing this repo without
touching production:

| | |
|---|---|
| Bucket | `igdrasil-landing-rebuild-034363017706-eu-north-1` |
| Distribution | `ELI06OBI6BSNN` → `d2uc4fjq2o7eqa.cloudfront.net` |

Same deploy steps, substituting those two identifiers. Safe to delete if
unused.
