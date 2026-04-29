import Image from "next/image";
import { agentLogos, siteCopy, terminalLines } from "@/lib/content";

export function EngineersAgents() {
  const { heading, sub, lovedByLabel } = siteCopy.engineersAgents;

  return (
    <section className="bg-background relative py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-black tracking-[0.02em] text-foreground">
              {heading}
            </h2>
            <p className="mt-4 text-base md:text-lg text-muted-foreground max-w-xl">
              {sub}
            </p>

            <div className="mt-10">
              <p className="text-[11px] uppercase tracking-[0.15em] text-subtle-foreground font-semibold">
                {lovedByLabel}
              </p>
              <div className="mt-4 flex items-center gap-6">
                {agentLogos.map((l) => (
                  <Image
                    key={l.name}
                    src={l.src}
                    alt={l.name}
                    width={40}
                    height={40}
                    className="size-10 object-contain rounded-[6px]"
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-[10px] bg-layer-2 border border-border overflow-hidden font-mono text-[12.5px]">
            <div className="h-9 bg-layer-3 border-b border-border flex items-center px-4 gap-2">
              <div className="flex gap-1.5">
                <div className="size-2.5 rounded-full bg-red-main" />
                <div className="size-2.5 rounded-full bg-yellow-main" />
                <div className="size-2.5 rounded-full bg-green-300" />
              </div>
              <span className="ml-3 text-[11px] text-muted-foreground">bash</span>
            </div>
            <div className="px-5 py-5 space-y-3 text-foreground/90 leading-6">
              {terminalLines.map((line, i) => {
                if (line.type === "command")
                  return (
                    <div key={i}>
                      <span className="text-muted-foreground">$ </span>
                      <span>{line.text}</span>
                    </div>
                  );
                if (line.type === "out-ok")
                  return (
                    <div key={i} className="text-muted-foreground/85">
                      <span>› </span>
                      <span className="text-green-300">✔</span> {line.text}
                    </div>
                  );
                if (line.type === "out")
                  return (
                    <div key={i} className="text-muted-foreground/85">
                      <span>› </span>
                      {line.text}
                    </div>
                  );
                // out-typing
                return (
                  <div key={i}>
                    <span className="text-muted-foreground">$ </span>
                    <span>
                      {line.text}
                      <span className="ml-0.5 inline-block w-2 h-4 bg-foreground/85 align-middle animate-pulse" />
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
