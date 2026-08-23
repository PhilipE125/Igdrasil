import type { Metadata } from "next";
import { ResearchArticles } from "@/components/research/ResearchArticles";
import { ResearchRail } from "@/components/research/ResearchRail";
import { ResearchRegister } from "@/components/research/ResearchRegister";
import { ResearchSeriesSection } from "@/components/research/ResearchSeriesSection";
import { Eyebrow } from "@/components/research/atoms";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import {
  DATA_THROUGH,
  LAST_INGEST_LABEL,
  liveSeries,
  researchArticles,
  researchSeries,
} from "@/lib/research";

const TITLE = "Research | Igdrasil AB";
const DESCRIPTION =
  "Standing measurements of the Swedish accounting economy — company registrations, accounting job openings, and more. Every series re-runs on a schedule and publishes its source query.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    siteName: "Igdrasil AB",
  },
};

export default function ResearchPage() {
  return (
    <>
      <SiteHeader />
      <main className="bg-background">
        <div className="mx-auto max-w-6xl px-6 lg:px-12">
          {/* Masthead */}
          <div className="grid gap-7 pt-28 pb-10 md:pt-36 md:pb-12 lg:grid-cols-[1fr_1.2fr] lg:gap-14">
            <h1 className="font-display text-5xl font-black leading-[0.92] tracking-[0.02em] text-foreground text-balance sm:text-6xl lg:text-7xl">
              Research
            </h1>
            <div>
              <p className="max-w-2xl text-lg leading-snug text-foreground text-pretty md:text-xl">
                We measure the Swedish accounting economy from public sources and publish
                everything we find &mdash; the numbers, the queries behind them, and what
                we think they mean. Every series re-runs on a schedule. Nothing here is
                archived.
              </p>
              <Eyebrow className="mt-5">
                Data through week {DATA_THROUGH.week}, {DATA_THROUGH.year}{" "}
                &middot; last ingest {LAST_INGEST_LABEL}
              </Eyebrow>
              <p className="mt-4 flex flex-wrap items-baseline gap-x-4 gap-y-1.5 text-sm">
                <span className="font-semibold text-foreground">Market research:</span>
                {researchSeries.map((s) => (
                  <a
                    key={s.id}
                    href={s.href}
                    className={
                      s.metric
                        ? "border-b border-border pb-px text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
                        : "border-b border-dashed border-border pb-px text-subtle-foreground transition-colors hover:border-foreground hover:text-foreground"
                    }
                  >
                    {s.title}
                  </a>
                ))}
              </p>
            </div>
          </div>

          <div className="grid border-t border-border lg:grid-cols-[13rem_1fr] lg:gap-12">
            <ResearchRail
              data={[
                ...liveSeries.map((s) => ({
                  id: s.id,
                  label: s.title,
                  icon: (s.chart === "area" ? "area" : "column") as "area" | "column",
                })),
                {
                  id: "market-research",
                  label: "All series",
                  icon: "table" as const,
                  count: researchSeries.length,
                },
              ]}
              writing={[
                {
                  id: "research-articles",
                  label: "Research articles",
                  icon: "doc" as const,
                  count: researchArticles.length,
                },
              ]}
            />

            <div className="min-w-0">
              {liveSeries.map((series) => (
                <ResearchSeriesSection key={series.id} series={series} />
              ))}
              <ResearchRegister series={researchSeries} />
              <ResearchArticles articles={researchArticles} />

              <div className="grid gap-8 border-t border-border py-12 sm:grid-cols-3 md:py-14">
                <div>
                  <h3 className="font-display text-base font-bold tracking-[0.02em] text-foreground">
                    Use the data
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground text-pretty">
                    Every series is downloadable as CSV with the source query attached.
                    Cite it, re-run it, or argue with it.
                  </p>
                </div>
                <div>
                  <h3 className="font-display text-base font-bold tracking-[0.02em] text-foreground">
                    Tell us we&rsquo;re wrong
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground text-pretty">
                    Corrections get their own dated entry, not a silent edit.{" "}
                    <a
                      href="mailto:support@igdrasil.se"
                      className="border-b border-foreground/35 text-foreground transition-colors hover:border-foreground"
                    >
                      support@igdrasil.se
                    </a>
                  </p>
                </div>
                <div>
                  <h3 className="font-display text-base font-bold tracking-[0.02em] text-foreground">
                    Get the weekly read
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground text-pretty">
                    One email when the numbers move enough to be worth your time.{" "}
                    <a
                      href="mailto:support@igdrasil.se?subject=Research%20digest"
                      className="border-b border-foreground/35 text-foreground transition-colors hover:border-foreground"
                    >
                      Subscribe
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
