import { CardRulesView } from "@/components/views/CardRulesView";

export function AutomationsSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Automatiseringar</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Regler som styr hur dokument klassificeras automatiskt.
        </p>
      </div>

      <CardRulesView />
    </div>
  );
}
