import {
  contextGraphFeatures,
  siteCopy,
} from "@/lib/content";
import { Integrations } from "./Integrations";

export function ContextGraph() {
  const { heading, sub } = siteCopy.contextGraph;
  return (
    <section className="bg-background flex flex-col justify-center py-16 md:py-20 overflow-hidden">
      <div className="mx-auto w-full max-w-6xl px-6 lg:px-12">
        <div className="text-center mb-12">
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-black tracking-[0.02em] text-foreground">
            {heading}
          </h2>
          <p className="mt-4 text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            {sub}
          </p>
        </div>
      </div>

      <Integrations />

      <div className="mx-auto w-full max-w-6xl px-6 lg:px-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {contextGraphFeatures.map((c) => (
            <div key={c.title} className="border border-border bg-card p-5 rounded-[2px]">
              <h3 className="text-base font-semibold text-foreground">{c.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground leading-snug">
                {c.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
