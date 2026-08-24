import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

// `output: "export"` needs metadata routes pinned to build time.
export const dynamic = "force-static";

/** Every route the site exports, highest-value first. */
const routes = [
  { path: "/", priority: 1 },
  { path: "/why-igdrasil", priority: 0.9 },
  { path: "/about", priority: 0.8 },
  { path: "/research", priority: 0.7 },
  { path: "/security-overview", priority: 0.4 },
  { path: "/privacy", priority: 0.3 },
  { path: "/terms", priority: 0.3 },
  { path: "/dpa", priority: 0.3 },
  { path: "/subprocessors", priority: 0.3 },
  { path: "/cookies", priority: 0.2 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map(({ path, priority }) => ({
    url: `${SITE_URL}${path === "/" ? "/" : `${path}/`}`,
    changeFrequency: path === "/research" ? "weekly" : "monthly",
    priority,
  }));
}
