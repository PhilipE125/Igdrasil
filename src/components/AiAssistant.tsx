"use client";

import { useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { siteCopy } from "@/lib/content";
import { BankMatchCard } from "./BankMatchCard";
import { ChatAssistantCard } from "./ChatAssistantCard";
import { InboxWorkflowCard } from "./InboxWorkflowCard";

const CARDS = [ChatAssistantCard, InboxWorkflowCard, BankMatchCard] as const;
const CYCLE_MS = 6500;

export function AiAssistant() {
  const { heading, sub } = siteCopy.ai;
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { amount: 0.2 });
  const [active, setActive] = useState(0);
  const [hovered, setHovered] = useState<number | null>(null);
  const [isLg, setIsLg] = useState(false);

  const displayActive = hovered ?? active;

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () => setIsLg(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!inView || hovered !== null) return;
    const id = window.setInterval(
      () => setActive((a) => (a + 1) % CARDS.length),
      CYCLE_MS,
    );
    return () => window.clearInterval(id);
  }, [inView, hovered]);

  return (
    <section
      ref={sectionRef}
      id="ai"
      className="bg-background @container flex items-center py-12 sm:py-16 md:py-20"
    >
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-12">
        <div className="text-center mb-10 sm:mb-12 md:mb-16">
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-[0.02em] text-foreground">
            {heading}
          </h2>
          <p className="mt-4 text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            {sub}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 md:gap-6 items-stretch">
          {CARDS.map((Card, i) => (
            <div
              key={i}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => {
                setActive(i);
                setHovered(null);
              }}
              onClick={() => setActive(i)}
              style={
                isLg
                  ? { flexGrow: displayActive === i ? 3 : 1, flexBasis: 0 }
                  : undefined
              }
              className={`min-w-0 cursor-pointer transition-[flex-grow,filter,opacity] duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                displayActive === i
                  ? "lg:blur-0 lg:opacity-100"
                  : "lg:[&_*]:[animation-play-state:paused] lg:blur-[3px] lg:opacity-70"
              }`}
            >
              <Card active={isLg ? displayActive === i : true} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
