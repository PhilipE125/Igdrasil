import { TokenUsageCard } from "@/components/usage/TokenUsageCard";

export function UsageSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Tokenanvändning</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Översikt av AI-tokenanvändning per modell.
        </p>
      </div>
      <TokenUsageCard />
    </div>
  );
}
