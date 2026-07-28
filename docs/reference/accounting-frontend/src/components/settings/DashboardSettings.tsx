import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ShieldCheck } from "lucide-react";
import { useDashboardPrefs } from "@/lib/hooks/useDashboardPrefs";

export function DashboardSettings() {
  const { showAuditTrail, setShowAuditTrail } = useDashboardPrefs();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Dashboard</h2>
        <p className="text-sm text-muted-foreground">
          Välj vilka sidor som visas i sidofältet.
        </p>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Sidofältets sidor</CardTitle>
          <CardDescription>Aktivera eller inaktivera sidor i navigeringen.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="audit-trail-toggle" className="cursor-pointer">
                <span className="text-sm font-medium">Audit Trail</span>
                <p className="text-xs text-muted-foreground">Visa granskningsloggen i sidofältet.</p>
              </Label>
            </div>
            <Switch
              id="audit-trail-toggle"
              checked={showAuditTrail}
              onCheckedChange={setShowAuditTrail}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
