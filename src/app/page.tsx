import { AgenticGuides } from "@/components/AgenticGuides";
import { AiAssistant } from "@/components/AiAssistant";
import { AutomationSkills } from "@/components/AutomationSkills";
import { BuiltToScale } from "@/components/BuiltToScale";
import { ContextGraph } from "@/components/ContextGraph";
import { DemoApp } from "@/components/DemoApp";
import { EngineersAgents } from "@/components/EngineersAgents";
import { FinalCTA } from "@/components/FinalCTA";
import { FounderNote } from "@/components/FounderNote";
import { Hero } from "@/components/Hero";
import { InvestorMarquee } from "@/components/InvestorMarquee";
import { ProductFeatures } from "@/components/ProductFeatures";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { Testimonial } from "@/components/Testimonial";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main>
        <Hero />
        <DemoApp />
        <InvestorMarquee />
        <ProductFeatures />
        <AiAssistant />
        <AutomationSkills />
        <Testimonial />
        <ContextGraph />
        <EngineersAgents />
        <BuiltToScale />
        <AgenticGuides />
        <FounderNote />
        <FinalCTA />
      </main>
      <SiteFooter />
    </>
  );
}
