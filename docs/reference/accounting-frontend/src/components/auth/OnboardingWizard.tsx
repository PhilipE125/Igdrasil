import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Briefcase,
  Building2,
  CheckCircle,
  ChevronRight,
  Crown,
  Loader2,
  User,
  Users,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import {
  getFortnoxAuthorizationUrl,
  getVismaAuthorizationUrl,
  connectBjornLunden,
  connectBriox,
  connectBokio,
  getFortnoxBureauClients,
  selectFortnoxBureauClient,
  type CompanyResponse,
  type FortnoxBureauClient,
} from "@/lib/uploadApi";
import { useCompany } from "@/contexts/CompanyContext";

// ── Types ─────────────────────────────────────────────────────────────────────

type PageId = "welcome" | "company" | "integration" | "bureau-select" | "done";

export interface OnboardingWizardProps {
  /** "onboarding" = first-time full-page flow; "add-company" = embedded in dialog */
  mode?: "onboarding" | "add-company";
  /** Called on completion in "add-company" mode */
  onComplete?: (company: CompanyResponse) => void;
}

// ── Role options ──────────────────────────────────────────────────────────────

// ── Integration options ───────────────────────────────────────────────────────

type CredField = { name: string; label: string; placeholder?: string; secret?: boolean };

interface IntegrationProvider {
  id: string;
  label: string;
  logo: string;
  desc: string;
  type: "oauth" | "credentials";
  fields?: CredField[];
  connect: (values: Record<string, string>, opts?: { bureauMode?: boolean }) => Promise<void>;
}

const PROVIDERS: IntegrationProvider[] = [
  {
    id: "fortnox",
    label: "Fortnox",
    logo: "/assets/logos/integrations/fortnox.png",
    desc: "OAuth2 · Verifikatexport & leverantörshantering",
    type: "oauth",
    connect: async (_values, opts) => {
      window.location.assign(
        await getFortnoxAuthorizationUrl({ returnTo: "/onboarding", serviceAccount: opts?.bureauMode }),
      );
    },
  },
  {
    id: "visma",
    label: "Visma eAccounting",
    logo: "/assets/logos/integrations/visma.png",
    desc: "OAuth2 · Verifikatexport",
    type: "oauth",
    connect: async () => { window.location.assign(await getVismaAuthorizationUrl({ returnTo: "/onboarding" })); },
  },
  {
    id: "bjornlunden",
    label: "Björn Lundén",
    logo: "/assets/logos/integrations/bjornlunden.webp",
    desc: "API-uppgifter · Verifikatexport",
    type: "credentials",
    fields: [
      { name: "client_id", label: "Client ID", placeholder: "bl_client_…" },
      { name: "client_secret", label: "Client Secret", placeholder: "••••••••", secret: true },
      { name: "user_key", label: "User Key", placeholder: "Din BL-användarnyckel" },
    ],
    connect: async (v) => { await connectBjornLunden({ client_id: v.client_id, client_secret: v.client_secret, user_key: v.user_key }); },
  },
  {
    id: "briox",
    label: "Briox",
    logo: "/assets/logos/integrations/briox.png",
    desc: "Application token · Verifikatexport",
    type: "credentials",
    fields: [
      { name: "application_token", label: "Application Token", placeholder: "••••••••", secret: true },
    ],
    connect: async (v) => { await connectBriox({ application_token: v.application_token }); },
  },
  {
    id: "bokio",
    label: "Bokio",
    logo: "/assets/logos/integrations/bokio.png",
    desc: "API-token · Verifikatexport",
    type: "credentials",
    fields: [
      { name: "api_token", label: "API Token", placeholder: "••••••••", secret: true },
      { name: "company_id", label: "Company ID", placeholder: "Ditt Bokio företags-UUID" },
    ],
    connect: async (v) => { await connectBokio({ api_token: v.api_token, company_id: v.company_id }); },
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function pagesFor(mode: "onboarding" | "add-company"): PageId[] {
  const base: PageId[] = ["company", "integration", "done"];
  return mode === "onboarding" ? ["welcome", ...base] : base;
}

// ── Component ─────────────────────────────────────────────────────────────────

export const OnboardingWizard = ({
  mode = "onboarding",
  onComplete,
}: OnboardingWizardProps) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { createCompany, companies } = useCompany();

  // UI state — initialize directly from URL params so OAuth callbacks land on
  // the correct page from the very first render (avoids a welcome-page flash).
  const [page, setPage] = useState<PageId>(() => {
    if (mode !== "onboarding") return "company";
    const params = new URLSearchParams(window.location.search);
    for (const p of ["fortnox", "visma"] as const) {
      const v = params.get(p);
      if (v === "connected") {
        // Bureau callback: need to select a client before going to done
        if (p === "fortnox" && params.get("bureau") === "1") return "bureau-select";
        return "done";
      }
      if (v === "error") return "integration";
    }
    return "welcome";
  });
  const [pageHistory, setPageHistory] = useState<PageId[]>([]);

  // Form state
  // Role system removed — users are just members
  const [companyName, setCompanyName] = useState("");
  const [orgNumber, setOrgNumber] = useState("");
  const [fiscalYearStart, setFiscalYearStart] = useState("01-01");
  const [firstFiscalYear, setFirstFiscalYear] = useState(() => new Date().getFullYear());
  const [accountingMethod, setAccountingMethod] = useState<"accrual" | "cash">("accrual");

  // Async state
  const [createdCompany, setCreatedCompany] = useState<CompanyResponse | null>(null);
  const [creating, setCreating] = useState(false);
  const [connectingId, setConnectingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [credValues, setCredValues] = useState<Record<string, string>>({});

  // Bureau (byrå) state
  const [bureauClients, setBureauClients] = useState<FortnoxBureauClient[]>([]);
  const [bureauLoading, setBureauLoading] = useState(false);
  const [bureauSelecting, setBureauSelecting] = useState(false);
  const [selectedBureauTenant, setSelectedBureauTenant] = useState<string | null>(null);

  // ── OAuth callback handling ──────────────────────────────────────────────────
  useEffect(() => {
    const oauthProviders = ["fortnox", "visma"] as const;
    for (const p of oauthProviders) {
      const val = searchParams.get(p);
      const reason = searchParams.get("reason");
      const isBureau = p === "fortnox" && searchParams.get("bureau") === "1";

      if (val === "connected") {
        setSearchParams({}, { replace: true });
        if (isBureau) {
          // Load bureau clients and go to the selection step
          setBureauLoading(true);
          getFortnoxBureauClients()
            .then((clients) => {
              setBureauClients(clients);
              setPage("bureau-select");
            })
            .catch(() => {
              toast({
                title: "Fortnox kopplat",
                description: "Kunde inte hämta klientlistan — välj klient senare under Inställningar.",
              });
              setPage("done");
            })
            .finally(() => setBureauLoading(false));
        } else {
          toast({
            title: `${p.charAt(0).toUpperCase() + p.slice(1)} kopplat!`,
            description: "Integrationen är nu aktiv.",
          });
          setPage("done");
        }
        break;
      } else if (val === "error") {
        toast({
          title: `${p.charAt(0).toUpperCase() + p.slice(1)} kunde inte kopplas`,
          description: reason || "OAuth-auktorisering misslyckades.",
          variant: "destructive",
        });
        setSearchParams({}, { replace: true });
        setPage("integration");
        break;
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Navigation helpers ─────────────────────────────────────────────────────

  const pages = pagesFor(mode);
  const currentIndex = pages.indexOf(page);
  // bureau-select and done are outside the numbered flow
  const progressPages = pages.filter((p) => p !== "done" && p !== "bureau-select");
  const progress = (page === "done" || page === "bureau-select") ? 100 : (currentIndex / progressPages.length) * 100;
  const totalSteps = progressPages.length;
  const stepNumber = currentIndex + (page === "done" || page === "bureau-select" ? 0 : 1);

  const goTo = (next: PageId) => {
    setPageHistory((h) => [...h, page]);
    setPage(next);
  };

  const goBack = () => {
    const prev = pageHistory[pageHistory.length - 1];
    if (prev) {
      setPageHistory((h) => h.slice(0, -1));
      setPage(prev);
    }
  };

  // ── Business logic ─────────────────────────────────────────────────────────

  const doCreateCompany = async () => {
    setCreating(true);
    try {
      const company = await createCompany({
        name: companyName.trim(),
        orgNumber: orgNumber.trim() || undefined,
        fiscalYearStart: fiscalYearStart,
        firstFiscalYear: firstFiscalYear,
        accountingMethod: accountingMethod,
      });
      setCreatedCompany(company);
      goTo("integration");
    } catch (err) {
      toast({
        title: "Kunde inte skapa företag",
        description: err instanceof Error ? err.message : "Okänt fel",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  const handleCompanyNext = async () => {
    if (!companyName.trim()) return;
    await doCreateCompany();
  };

  const handleConnect = async (
    provider: IntegrationProvider,
    values: Record<string, string> = {},
    opts?: { bureauMode?: boolean },
  ) => {
    setConnectingId(provider.id);
    try {
      await provider.connect(values, opts);
      // OAuth providers redirect away; for credential providers move to done
      setExpandedId(null);
      goTo("done");
    } catch (err) {
      toast({
        title: `Kunde inte ansluta ${provider.label}`,
        description: err instanceof Error ? err.message : "Okänt fel",
        variant: "destructive",
      });
    } finally {
      setConnectingId(null);
    }
  };

  const handleBureauClientConfirm = async () => {
    if (!selectedBureauTenant) return;
    setBureauSelecting(true);
    try {
      await selectFortnoxBureauClient(selectedBureauTenant);
      const name = bureauClients.find((c) => c.tenant_id === selectedBureauTenant)?.company_name;
      toast({
        title: "Klientkoppling sparad",
        description: name ? `Kopplar till ${name}` : "Fortnox-klient vald.",
      });
      goTo("done");
    } catch (err) {
      toast({
        title: "Kunde inte spara klientval",
        description: err instanceof Error ? err.message : "Okänt fel",
        variant: "destructive",
      });
    } finally {
      setBureauSelecting(false);
    }
  };

  const handleFinish = () => {
    if (mode === "add-company" && onComplete && createdCompany) {
      onComplete(createdCompany);
    } else {
      navigate("/");
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  const showBack = pageHistory.length > 0 && page !== "done" && page !== "welcome" && page !== "bureau-select";
  const showProgress = page !== "welcome" && page !== "done" && page !== "bureau-select";

  return (
    <div
      className={cn(
        mode === "onboarding" &&
          "flex min-h-dvh items-center justify-center bg-background px-4",
      )}
    >
      <Card
        className={cn(
          "w-full",
          mode === "onboarding" ? "max-w-lg" : "border-0 shadow-none",
        )}
      >
        <CardHeader className="pb-2">
          {mode === "onboarding" && (
            <CardTitle className="font-bold tracking-tight text-2xl text-center">Igdrasil</CardTitle>
          )}
          {showProgress && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Steg {stepNumber} av {totalSteps}</span>
              </div>
              <Progress value={progress} className="h-1.5" />
            </div>
          )}
        </CardHeader>

        <CardContent className="space-y-5">

          {/* ──────── Welcome ──────── */}
          {page === "welcome" && (
            <div className="flex flex-col items-center text-center gap-4 py-4">
              <CheckCircle className="h-14 w-14 text-primary" />
              <div>
                <h2 className="text-xl font-semibold">Kontot är skapat!</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Låt oss ställa in ditt arbetsrum. Det tar bara en minut.
                </p>
              </div>
              <Button className="w-full" onClick={() => goTo("company")}>
                Kom igång <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          )}

          {/* ──────── Company details ──────── */}
          {page === "company" && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Företagsuppgifter
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Vilket företag vill du lägga till?
                </p>
              </div>

              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="companyName">Företagsnamn *</Label>
                  <Input
                    id="companyName"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="AB Exempelföretaget"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && companyName.trim()) handleCompanyNext();
                    }}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="orgNumber">Organisationsnummer</Label>
                  <Input
                    id="orgNumber"
                    value={orgNumber}
                    onChange={(e) => setOrgNumber(e.target.value)}
                    placeholder="556123-4567"
                  />
                  <p className="text-xs text-muted-foreground">
                    Valfritt – kan läggas till senare under Inställningar.
                  </p>
                </div>

                {/* ── Fiscal year settings (matches Fortnox setup) ── */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Räkenskapsår börjar</Label>
                    <Select value={fiscalYearStart} onValueChange={setFiscalYearStart}>
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="01-01">Januari (01-01)</SelectItem>
                        <SelectItem value="02-01">Februari (02-01)</SelectItem>
                        <SelectItem value="03-01">Mars (03-01)</SelectItem>
                        <SelectItem value="04-01">April (04-01)</SelectItem>
                        <SelectItem value="05-01">Maj (05-01)</SelectItem>
                        <SelectItem value="06-01">Juni (06-01)</SelectItem>
                        <SelectItem value="07-01">Juli (07-01)</SelectItem>
                        <SelectItem value="08-01">Augusti (08-01)</SelectItem>
                        <SelectItem value="09-01">September (09-01)</SelectItem>
                        <SelectItem value="10-01">Oktober (10-01)</SelectItem>
                        <SelectItem value="11-01">November (11-01)</SelectItem>
                        <SelectItem value="12-01">December (12-01)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="firstFiscalYear">Första räkenskapsår</Label>
                    <Input
                      id="firstFiscalYear"
                      type="number"
                      min={2000}
                      max={2099}
                      value={firstFiscalYear}
                      onChange={(e) => setFirstFiscalYear(Number(e.target.value))}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label>Bokföringsmetod</Label>
                  <Select value={accountingMethod} onValueChange={(v) => setAccountingMethod(v as "accrual" | "cash")}>
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="accrual">Faktureringsmetoden (accrual)</SelectItem>
                      <SelectItem value="cash">Kontantmetoden (cash)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    De flesta aktiebolag använder faktureringsmetoden. Enskilda firmor med omsättning under 3 mkr kan välja kontantmetoden.
                  </p>
                </div>
              </div>

              <Button
                className="w-full"
                onClick={handleCompanyNext}
                disabled={!companyName.trim() || creating}
              >
                {creating ? (
                  "Skapar…"
                ) : (
                  <>
                    Nästa <ChevronRight className="ml-1 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          )}

          {/* ──────── Integration setup ──────── */}
          {page === "integration" && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Koppla bokföringssystem
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Koppla ett bokföringssystem nu eller gör det senare under{" "}
                  <strong>Inställningar</strong>.
                </p>
              </div>

              <div className="divide-y divide-border rounded-lg border border-border">
                {PROVIDERS.map((provider) => {
                  const isExpanded = expandedId === provider.id;
                  const isBusy = connectingId === provider.id;
                  const isFortnox = provider.id === "fortnox";
                  return (
                    <div key={provider.id}>
                      {/* Main row */}
                      <div className="flex items-center gap-3 px-3 py-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center">
                          <img
                            src={provider.logo}
                            alt={provider.label}
                            className="h-full w-full rounded object-contain"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium leading-none">{provider.label}</p>
                          <p className="mt-0.5 text-xs text-muted-foreground truncate">{provider.desc}</p>
                        </div>
                        {provider.type === "oauth" && !isFortnox && (
                          <Button
                            size="sm"
                            className="h-7 text-xs shrink-0"
                            disabled={isBusy || connectingId !== null}
                            onClick={() => handleConnect(provider)}
                          >
                            {isBusy ? <Loader2 className="h-3 w-3 animate-spin" /> : "Koppla"}
                          </Button>
                        )}
                        {provider.type === "credentials" && (
                          <Button
                            size="sm"
                            variant={isExpanded ? "secondary" : "default"}
                            className="h-7 text-xs shrink-0"
                            disabled={connectingId !== null}
                            onClick={() => {
                              const next = isExpanded ? null : provider.id;
                              setExpandedId(next);
                              if (next) setCredValues(Object.fromEntries((provider.fields ?? []).map((f) => [f.name, ""])));
                            }}
                          >
                            {isExpanded ? "Avbryt" : "Koppla"}
                          </Button>
                        )}
                      </div>

                      {/* Fortnox: two explicit connect options (standard vs byrå) */}
                      {isFortnox && provider.type === "oauth" && (
                        <div className="grid grid-cols-2 gap-2 border-t border-border bg-muted/20 px-3 py-3">
                          <Button
                            size="sm"
                            className="h-8 text-xs"
                            disabled={isBusy || connectingId !== null}
                            onClick={() => handleConnect(provider, {}, { bureauMode: false })}
                          >
                            {isBusy && connectingId === provider.id ? (
                              <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
                            ) : null}
                            Koppla
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 text-xs gap-1.5"
                            disabled={isBusy || connectingId !== null}
                            onClick={() => handleConnect(provider, {}, { bureauMode: true })}
                          >
                            <Users className="h-3 w-3 shrink-0" />
                            Koppla som byrå
                          </Button>
                          <p className="col-span-2 text-[11px] text-muted-foreground leading-relaxed">
                            Välj <strong>Koppla som byrå</strong> om du är en redovisningsbyrå som hanterar flera klientbolag i Fortnox.
                          </p>
                        </div>
                      )}

                      {/* Inline credential form */}
                      {isExpanded && provider.type === "credentials" && (
                        <div className="border-t border-border bg-muted/30 px-3 py-3 space-y-2">
                          {(provider.fields ?? []).map((field) => (
                            <div key={field.name} className="space-y-1">
                              <Label className="text-xs" htmlFor={`ob-${provider.id}-${field.name}`}>{field.label}</Label>
                              <Input
                                id={`ob-${provider.id}-${field.name}`}
                                className="h-8 text-xs"
                                type={field.secret ? "password" : "text"}
                                placeholder={field.placeholder}
                                value={credValues[field.name] ?? ""}
                                onChange={(e) => setCredValues((prev) => ({ ...prev, [field.name]: e.target.value }))}
                              />
                            </div>
                          ))}
                          <Button
                            size="sm"
                            className="mt-1 h-7 text-xs"
                            disabled={isBusy}
                            onClick={() => {
                              const missing = (provider.fields ?? []).find((f) => !credValues[f.name]?.trim());
                              if (missing) { toast({ title: `${missing.label} krävs`, variant: "destructive" }); return; }
                              handleConnect(provider, credValues);
                            }}
                          >
                            {isBusy ? "Ansluter…" : "Spara & anslut"}
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <Button
                variant="ghost"
                className="w-full text-muted-foreground text-sm"
                onClick={() => goTo("done")}
              >
                Hoppa över – jag gör detta senare
              </Button>
            </div>
          )}

          {/* ──────── Bureau client selection ──────── */}
          {page === "bureau-select" && (
            <div className="space-y-4">
              <div className="flex flex-col items-center text-center gap-2 pb-1">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h2 className="text-lg font-semibold">Välj klientföretag</h2>
                <p className="text-sm text-muted-foreground">
                  Du är inloggad som byrå i Fortnox. Välj vilket klientbolag du vill koppla till det här kontot.
                </p>
              </div>

              {bureauLoading ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : bureauClients.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border p-6 text-center">
                  <p className="text-sm text-muted-foreground">
                    Inga tillgängliga klientbolag hittades för detta byråkonto.
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {bureauClients.map((client) => (
                    <button
                      key={client.tenant_id}
                      type="button"
                      onClick={() => setSelectedBureauTenant(client.tenant_id)}
                      className={cn(
                        "w-full flex items-center gap-3 rounded-lg border-2 px-4 py-3 text-left transition-all",
                        selectedBureauTenant === client.tenant_id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/40 hover:bg-muted/30",
                      )}
                    >
                      <div
                        className={cn(
                          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                          selectedBureauTenant === client.tenant_id
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground",
                        )}
                      >
                        {client.company_name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium leading-none">{client.company_name}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">ID: {client.tenant_id}</p>
                      </div>
                      {selectedBureauTenant === client.tenant_id && (
                        <CheckCircle className="h-4 w-4 shrink-0 text-primary" />
                      )}
                    </button>
                  ))}
                </div>
              )}

              <Button
                className="w-full"
                disabled={!selectedBureauTenant || bureauSelecting}
                onClick={handleBureauClientConfirm}
              >
                {bureauSelecting ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Sparar…</>
                ) : (
                  <>Bekräfta val <ChevronRight className="ml-1 h-4 w-4" /></>
                )}
              </Button>

              <Button
                variant="ghost"
                className="w-full text-muted-foreground text-sm"
                onClick={() => goTo("done")}
              >
                Hoppa över – välj klient senare under Inställningar
              </Button>
            </div>
          )}

          {/* ──────── Done ──────── */}
          {page === "done" && (
            <div className="flex flex-col items-center text-center gap-4 py-4">
              <CheckCircle className="h-14 w-14 text-primary" />
              <div>
                <h2 className="text-xl font-semibold">Allt klart! 🎉</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  <strong>{createdCompany?.name ?? companies[0]?.name ?? "Ditt företag"}</strong> är nu konfigurerat
                  och redo att använda.
                </p>
              </div>
              <Button className="w-full" onClick={handleFinish}>
                {mode === "add-company" ? "Stäng" : "Gå till appen →"}
              </Button>
            </div>
          )}

          {/* ──────── Back button ──────── */}
          {showBack && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-muted-foreground"
              onClick={goBack}
            >
              ← Tillbaka
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
