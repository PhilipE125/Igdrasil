import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { useCompany } from "@/contexts/CompanyContext";
import { updateCompany, listFiscalPeriods } from "@/lib/uploadApi";
import { Pencil, Mail, Lock, CalendarDays } from "lucide-react";

const BUSINESS_FORMS = [
  { value: "AB", label: "Aktiebolag (AB)" },
  { value: "HB", label: "Handelsbolag (HB)" },
  { value: "KB", label: "Kommanditbolag (KB)" },
  { value: "EF", label: "Enskild firma (EF)" },
  { value: "EK", label: "Ekonomisk förening" },
  { value: "ideell", label: "Ideell förening" },
  { value: "stiftelse", label: "Stiftelse" },
];

const FISCAL_YEAR_OPTIONS = [
  { value: "01-01", label: "Januari – December (kalenderår)" },
  { value: "02-01", label: "Februari – Januari" },
  { value: "03-01", label: "Mars – Februari" },
  { value: "04-01", label: "April – Mars" },
  { value: "05-01", label: "Maj – April" },
  { value: "06-01", label: "Juni – Maj" },
  { value: "07-01", label: "Juli – Juni" },
  { value: "08-01", label: "Augusti – Juli" },
  { value: "09-01", label: "September – Augusti" },
  { value: "10-01", label: "Oktober – September" },
  { value: "11-01", label: "November – Oktober" },
  { value: "12-01", label: "December – November" },
];

export function CompanyProfileSettings() {
  const { activeCompany, refreshCompanies } = useCompany();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [orgNumber, setOrgNumber] = useState("");
  const [fiscalYear, setFiscalYear] = useState("01-01");
  const [businessForm, setBusinessForm] = useState("");
  const [accountingMethod, setAccountingMethod] = useState("accrual");
  const [senderEmail, setSenderEmail] = useState("");

  const fiscalPeriodsQuery = useQuery({
    queryKey: ["fiscal-periods", activeCompany?.id],
    queryFn: listFiscalPeriods,
    enabled: !!activeCompany,
  });
  const fiscalPeriods = fiscalPeriodsQuery.data ?? [];

  useEffect(() => {
    if (activeCompany) {
      setName(activeCompany.name ?? "");
      setOrgNumber((activeCompany as Record<string, unknown>).org_number as string ?? "");
      setFiscalYear((activeCompany as Record<string, unknown>).fiscal_year_start as string ?? "01-01");
      setBusinessForm((activeCompany as Record<string, unknown>).business_form as string ?? "");
      setAccountingMethod((activeCompany as Record<string, unknown>).accounting_method as string ?? "accrual");
      setSenderEmail((activeCompany as Record<string, unknown>).sender_email as string ?? "");
    }
  }, [activeCompany]);

  const handleSave = async () => {
    if (!activeCompany) return;
    setSaving(true);
    try {
      await updateCompany(activeCompany.id, {
        name: name.trim(),
        org_number: orgNumber.trim() || null,
        fiscal_year_start: fiscalYear,
        business_form: businessForm || null,
        accounting_method: accountingMethod,
        sender_email: senderEmail.trim() || null,
      } as Record<string, unknown>);
      await refreshCompanies();
      toast({ title: "Sparat" });
      setEditing(false);
    } catch (err) {
      toast({ title: "Fel", description: err instanceof Error ? err.message : "Kunde inte spara.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const empty = <span className="italic text-muted-foreground/50">Ej angivet</span>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Företagsprofil</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Grundläggande uppgifter om företaget.
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">Företagsuppgifter</CardTitle>
            <CardDescription>Namn, organisationsnummer och bolagsform</CardDescription>
          </div>
          {!editing && (
            <Button variant="outline" size="sm" className="gap-1" onClick={() => setEditing(true)}>
              <Pencil className="h-3 w-3" /> Redigera
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {editing ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="company-name">Företagsnamn *</Label>
                  <Input id="company-name" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="org-number">Organisationsnummer</Label>
                  <Input id="org-number" value={orgNumber} onChange={(e) => setOrgNumber(e.target.value)} placeholder="556677-8899" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Bolagsform</Label>
                <Select value={businessForm} onValueChange={setBusinessForm}>
                  <SelectTrigger>
                    <SelectValue placeholder="Välj bolagsform..." />
                  </SelectTrigger>
                  <SelectContent>
                    {BUSINESS_FORMS.map((bf) => (
                      <SelectItem key={bf.value} value={bf.value}>{bf.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2 pt-1">
                <Button size="sm" onClick={handleSave} disabled={saving || !name.trim()}>
                  {saving ? "Sparar…" : "Spara"}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>Avbryt</Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Företagsnamn</p>
                <p className="font-medium">{activeCompany?.name ?? empty}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Organisationsnummer</p>
                <p className="font-medium">{(activeCompany as Record<string, unknown>)?.org_number as string ?? empty}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Bolagsform</p>
                <p className="font-medium">
                  {BUSINESS_FORMS.find((bf) => bf.value === (activeCompany as Record<string, unknown>)?.business_form)?.label ?? empty}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">Bokföringsinställningar</CardTitle>
            <CardDescription>Räkenskapsår och bokföringsmetod</CardDescription>
          </div>
          {!editing && (
            <Button variant="outline" size="sm" className="gap-1" onClick={() => setEditing(true)}>
              <Pencil className="h-3 w-3" /> Redigera
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {editing ? (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label>Räkenskapsår</Label>
                <Select value={fiscalYear} onValueChange={setFiscalYear}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FISCAL_YEAR_OPTIONS.map((fy) => (
                      <SelectItem key={fy.value} value={fy.value}>{fy.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Bokföringsmetod</Label>
                <Select value={accountingMethod} onValueChange={setAccountingMethod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="accrual">Fakturametoden</SelectItem>
                    <SelectItem value="cash">Kontantmetoden</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {accountingMethod === "accrual"
                    ? "Intäkter och kostnader bokförs vid fakturadatum, oavsett betalning."
                    : "Intäkter och kostnader bokförs först vid betalning."}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Räkenskapsår börjar</p>
                  <p className="font-medium">
                    {FISCAL_YEAR_OPTIONS.find((fy) => fy.value === fiscalYear)?.label ?? empty}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Bokföringsmetod</p>
                  <p className="font-medium">
                    {accountingMethod === "accrual" ? "Fakturametoden" : accountingMethod === "cash" ? "Kontantmetoden" : empty}
                  </p>
                </div>
              </div>

              {fiscalPeriods.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                    <CalendarDays className="h-3 w-3" />
                    Räkenskapsperioder
                  </p>
                  <div className="divide-y divide-border rounded-lg border border-border">
                    {fiscalPeriods.map((fp) => (
                      <div key={fp.id} className="flex items-center justify-between px-3 py-2 text-sm">
                        <span className="tabular-nums">
                          {fp.period_start} — {fp.period_end}
                        </span>
                        <div className="flex items-center gap-1.5">
                          {fp.is_closed ? (
                            <Badge variant="secondary" className="text-[11px] gap-1">
                              <Lock className="h-2.5 w-2.5" />
                              Stängt
                            </Badge>
                          ) : fp.is_locked ? (
                            <Badge variant="outline" className="text-[11px] gap-1">
                              <Lock className="h-2.5 w-2.5" />
                              Låst
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-[11px] text-muted-foreground">
                              Öppet
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Mail className="h-4 w-4" />
              E-postinställningar
            </CardTitle>
            <CardDescription>
              Avsändaradress för lönespecifikationer och andra utskick
            </CardDescription>
          </div>
          {!editing && (
            <Button variant="outline" size="sm" className="gap-1" onClick={() => setEditing(true)}>
              <Pencil className="h-3 w-3" /> Redigera
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {editing ? (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="sender-email">Avsändaradress</Label>
                <Input
                  id="sender-email"
                  type="email"
                  value={senderEmail}
                  onChange={(e) => setSenderEmail(e.target.value)}
                  placeholder="loner@foretaget.se"
                />
                <p className="text-xs text-muted-foreground">
                  Denna e-postadress används som avsändare när lönespecifikationer skickas till anställda.
                  Varje anställd får ett individuellt e-postmeddelande — aldrig gruppmail.
                </p>
              </div>
            </div>
          ) : (
            <div className="text-sm">
              <p className="text-xs text-muted-foreground">Avsändaradress</p>
              <p className="font-medium">
                {(activeCompany as Record<string, unknown>)?.sender_email as string ?? empty}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Lönespecifikationer skickas individuellt till varje anställd — aldrig som gruppmail.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
