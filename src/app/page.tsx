import { Roadmap } from "@/components/Roadmap";
import { AgentApi } from "@/components/AgentApi";
import { AiAssistant } from "@/components/AiAssistant";
import { AutomationSkills } from "@/components/AutomationSkills";
import { BuiltToScale } from "@/components/BuiltToScale";
import { ContextGraph } from "@/components/ContextGraph";
import { FinalCTA } from "@/components/FinalCTA";
import { JsonLd } from "@/components/JsonLd";
import { FounderNote } from "@/components/FounderNote";
import { Hero } from "@/components/Hero";
import { Pricing } from "@/components/Pricing";
import { ProductFeatures } from "@/components/ProductFeatures";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { Testimonial } from "@/components/Testimonial";
import { organizationSchema, websiteSchema } from "@/lib/seo";

export default function Home() {
  return (
    <>
      <JsonLd data={organizationSchema()} />
      <JsonLd data={websiteSchema()} />
      <SiteHeader />
      <main>
        <Hero />
        <ProductFeatures />
        <AiAssistant />
        <AutomationSkills />
        <Testimonial />
        <ContextGraph />
        <AgentApi />
        <BuiltToScale />
        <Pricing />
        <Roadmap />
        <FounderNote />
        <FinalCTA />
      </main>
      <SiteFooter />
    </>
  );
}
