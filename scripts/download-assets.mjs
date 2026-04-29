#!/usr/bin/env node
import { mkdir, writeFile, access } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url)) + "/..";
const PUBLIC = join(root, "public");
const FONT_DIR = join(PUBLIC, "fonts");

const ROOT = "https://www.micro.so";

const fonts = [
  ["/_next/static/media/subset_Haffer_Regular-s.p.2539f6f7.woff2", "fonts/haffer-regular.woff2"],
  ["/_next/static/media/subset_Haffer_Medium-s.p.aa8aa794.woff2", "fonts/haffer-medium.woff2"],
  ["/_next/static/media/HafferBold-s.p.e76e3678.ttf", "fonts/haffer-bold.ttf"],
  ["/_next/static/media/HafferHeavy-s.p.78aa8c90.ttf", "fonts/haffer-heavy.ttf"],
  ["/_next/static/media/perfectly_nineties_regular-s.p.daebb128.otf", "fonts/perfectly-nineties-regular.otf"],
];

const localImages = [
  "/audio/mika-album-2.png",
  "/images/sky-bg.jpg",
  "/images/sky-bg-dark.jpg",
  "/images/micro-night-bg.png",
  "/images/testimonial-bg.jpg",
  "/images/testimonial-bg-dark.jpg",
  "/images/grass-field.jpg",
  "/images/brett.jpeg",
  "/images/jacobpeters.jpeg",
  "/images/signature.png",
  "/images/video-thumb-brett.png",
  "/images/og.png",
  "/images/icon.svg",
  "/images/apple-touch-icon.png",
  "/favicon.ico",
  "/site.webmanifest",
  "/images/logos/claude.png",
  "/images/logos/codex.png",
  "/images/logos/openclaw.png",
  "/images/logos/hermes-agent.jpg",
  "/images/blog/why-we-built-micro-hero.png",
  "/images/blog/how-we-think-about-crm-hero.png",
  "/images/blog/death-of-tab-switching-hero.png",
  "/images/blog/meetings-that-matter-hero.png",
];

// Brand logos served by logo.dev — download with "dark" theme variant
// then a non-themed variant where applicable
const brandLogosDark = [
  "a16z.com", "ycombinator.com", "flybridge.com", "graphventures.com", "verissimoventures.com",
  "hyperspell.com", "superpower.com", "recall.ai", "hyper.com", "joinvalley.com",
  "google.com", "meta.com", "openai.com", "anthropic.com", "dropbox.com",
  "superhuman.com", "beeper.com", "hubspot.com", "salesforce.com", "attio.com",
  "otter.ai", "fireflies.ai", "granola.ai", "linear.app", "asana.com", "notion.so",
  "cursor.com",
];

const brandLogosColor = [
  "slack.com", "notion.so", "linear.app", "linkedin.com", "x.com",
  "dropbox.com", "stripe.com", "granola.ai",
];

const gstaticLogos = [
  ["https://www.gstatic.com/images/branding/product/1x/gmail_2020q4_48dp.png", "images/brand/gmail.png"],
  ["https://www.gstatic.com/images/branding/product/1x/calendar_2020q4_48dp.png", "images/brand/google-calendar.png"],
];

const cdnAssets = [
  ["https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/png/openclaw.png", "images/brand/openclaw-cdn.png"],
];

async function ensureDir(p) {
  await mkdir(dirname(p), { recursive: true });
}

async function exists(p) {
  try { await access(p); return true; } catch { return false; }
}

async function download(url, target) {
  const dest = join(PUBLIC, target);
  await ensureDir(dest);
  if (await exists(dest)) return { url, status: "skip" };
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      },
    });
    if (!res.ok) return { url, status: `error ${res.status}` };
    const buf = Buffer.from(await res.arrayBuffer());
    await writeFile(dest, buf);
    return { url, status: "ok", bytes: buf.length };
  } catch (err) {
    return { url, status: `error ${err.message}` };
  }
}

async function batch(items, n = 6) {
  const results = [];
  for (let i = 0; i < items.length; i += n) {
    const slice = items.slice(i, i + n);
    const r = await Promise.all(slice.map(({ url, target }) => download(url, target)));
    results.push(...r);
    process.stdout.write(`  ${Math.min(i + n, items.length)}/${items.length}\r`);
  }
  process.stdout.write("\n");
  return results;
}

const TOKEN = "pk_Rpshfn3cT_qTbdaJuMztKA";
const slugify = (s) => s.replace(/[^a-z0-9]/gi, "-").toLowerCase();

const tasks = [
  ...fonts.map(([rel, target]) => ({ url: ROOT + rel, target })),
  ...localImages.map((rel) => ({ url: ROOT + rel, target: rel.replace(/^\//, "") })),
  ...gstaticLogos.map(([url, target]) => ({ url, target })),
  ...cdnAssets.map(([url, target]) => ({ url, target })),
  ...brandLogosDark.map((d) => ({
    url: `https://img.logo.dev/${d}?token=${TOKEN}&format=png&size=128&theme=dark`,
    target: `images/brand/${slugify(d)}-dark.png`,
  })),
  ...brandLogosColor.map((d) => ({
    url: `https://img.logo.dev/${d}?token=${TOKEN}&format=png&size=64`,
    target: `images/brand/${slugify(d)}.png`,
  })),
];

(async () => {
  console.log(`Downloading ${tasks.length} assets...`);
  const results = await batch(tasks, 8);
  const ok = results.filter((r) => r.status === "ok").length;
  const skip = results.filter((r) => r.status === "skip").length;
  const err = results.filter((r) => r.status.startsWith("error"));
  console.log(`  ok: ${ok}  skipped: ${skip}  errors: ${err.length}`);
  if (err.length) {
    console.log("Errors:");
    err.forEach((e) => console.log(`  ${e.status}  ${e.url}`));
  }
})();
