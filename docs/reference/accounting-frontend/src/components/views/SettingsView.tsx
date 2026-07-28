import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { TokenUsageCard } from "@/components/usage/TokenUsageCard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import {
  disconnectFortnox,
  disconnectVisma,
  disconnectBjornLunden,
  disconnectBriox,
  disconnectBokio,
  getFortnoxAuthorizationUrl,
  getVismaAuthorizationUrl,
  connectBjornLunden,
  connectBriox,
  connectBokio,
  getFortnoxStatus,
  getVismaStatus,
  getBjornLundenStatus,
  getBrioxStatus,
  getBokioStatus,
  getFortnoxBureauClients,
  selectFortnoxBureauClient,
  generateMcpKey,
  revokeMcpKey,
  getMcpKeyStatus,
  getTelegramStatus,
  connectTelegram,
  disconnectTelegram,
  generateTelegramLinkCode,
  getTelegramLinkedUsers,
  type FortnoxStatusResponse,
  type FortnoxBureauClient,
  type ProviderStatusResponse,
  type TelegramStatusResponse,
  type TelegramLinkedUser,
  startFortnoxSync,
  getFortnoxSyncStatus,
  resetFortnoxData,
  type SyncStatusEntry,
  getGmailStatus,
  getGmailAuthorizationUrl,
  disconnectGmail,
  triggerGmailSync,
  type GmailStatusResponse,
} from "@/lib/uploadApi";
import { runtimeConfig } from "@/lib/runtimeConfig";
import { useCompany } from "@/contexts/CompanyContext";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Loader2, Plug, Copy, KeyRound, Trash2, AlertCircle, MessageCircle, Building2, RefreshCw, Check, Mail } from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────

interface AllStatuses {
  fortnox: FortnoxStatusResponse | null;
  visma: ProviderStatusResponse | null;
  bjornlunden: ProviderStatusResponse | null;
  briox: ProviderStatusResponse | null;
  bokio: ProviderStatusResponse | null;
  gmail: GmailStatusResponse | null;
}

type CredentialField = { name: string; label: string; placeholder?: string; type?: string };

interface ProviderConfig {
  key: keyof AllStatuses;
  name: string;
  description: string;
  logo: string;
  type: "oauth" | "credentials";
  fields?: CredentialField[];
  onConnect: (
    values: Record<string, string>,
    refreshAll: () => Promise<void>
  ) => Promise<void>;
  onDisconnect: (refreshAll: () => Promise<void>) => Promise<void>;
}

// ── Provider row ───────────────────────────────────────────────────────────

function ProviderRow({
  config,
  status,
  globalLoading,
  refreshAll,
}: {
  config: ProviderConfig;
  status: ProviderStatusResponse | FortnoxStatusResponse | null;
  globalLoading: boolean;
  refreshAll: () => Promise<void>;
}) {
  const [expanded, setExpanded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries((config.fields ?? []).map((f) => [f.name, ""]))
  );

  const connected = !!status?.connected;

  const handleOAuthConnect = async () => {
    setBusy(true);
    try {
      await config.onConnect({}, refreshAll);
    } catch (err) {
      toast({
        title: `Could not connect ${config.name}`,
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
      setBusy(false);
    }
  };

  const handleCredentialConnect = async () => {
    const missing = (config.fields ?? []).find((f) => !values[f.name]?.trim());
    if (missing) {
      toast({ title: `${missing.label} is required`, variant: "destructive" });
      return;
    }
    setBusy(true);
    try {
      await config.onConnect(values, refreshAll);
      toast({ title: `${config.name} connected` });
      setValues(Object.fromEntries((config.fields ?? []).map((f) => [f.name, ""])));
      setExpanded(false);
    } catch (err) {
      toast({
        title: `Could not connect ${config.name}`,
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setBusy(false);
    }
  };

  const handleDisconnect = async () => {
    setBusy(true);
    try {
      await config.onDisconnect(refreshAll);
      toast({ title: `${config.name} disconnected` });
    } catch (err) {
      toast({
        title: `Could not disconnect ${config.name}`,
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      {/* Main row */}
      <div className="flex items-center gap-4 px-4 py-3">
        {/* Integration logo */}
        <div className="flex size-9 shrink-0 items-center justify-center">
          <img
            src={config.logo}
            alt={config.name}
            className="h-full w-full rounded-md object-contain"
          />
        </div>

        {/* Name + description */}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium leading-none text-foreground">{config.name}</p>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">{config.description}</p>
        </div>

        {/* Status + action */}
        <div className="flex shrink-0 items-center gap-2">
          {globalLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : connected ? (
            <>
              <Badge variant="secondary" className="text-xs">Connected</Badge>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive"
                disabled={busy}
                onClick={handleDisconnect}
              >
                {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : <><Plug className="mr-1 h-3 w-3" />Disconnect</>}
              </Button>
            </>
          ) : config.type === "oauth" ? (
            <Button size="sm" className="h-7 text-xs" disabled={busy} onClick={handleOAuthConnect}>
              {busy ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : null}
              Connect
            </Button>
          ) : (
            <Button
              size="sm"
              variant={expanded ? "secondary" : "default"}
              className="h-7 text-xs"
              onClick={() => setExpanded((v) => !v)}
            >
              {expanded ? "Cancel" : "Connect"}
            </Button>
          )}
        </div>
      </div>

      {/* Inline credential form */}
      {expanded && !connected && config.type === "credentials" && (
        <div className="border-t border-border bg-muted/30 px-4 py-3">
          <div className="grid gap-2 sm:grid-cols-2">
            {(config.fields ?? []).map((field) => (
              <div key={field.name} className="space-y-1">
                <Label className="text-xs" htmlFor={`${config.key}-${field.name}`}>
                  {field.label}
                </Label>
                <Input
                  id={`${config.key}-${field.name}`}
                  className="h-8 text-xs"
                  type={field.type ?? "text"}
                  placeholder={field.placeholder}
                  value={values[field.name]}
                  onChange={(e) => setValues((prev) => ({ ...prev, [field.name]: e.target.value }))}
                />
              </div>
            ))}
          </div>
          <Button size="sm" className="mt-3 h-7 text-xs" disabled={busy} onClick={handleCredentialConnect}>
            {busy ? <><Loader2 className="mr-1 h-3 w-3 animate-spin" />Connecting…</> : `Save & Connect`}
          </Button>
        </div>
      )}
    </div>
  );
}

// ── Fortnox bureau client selection card ───────────────────────────────────

function FortnoxBureauSelectionCard({
  onSelected,
}: {
  onSelected: () => void;
}) {
  const [clients, setClients] = useState<FortnoxBureauClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTenantId, setSelectedTenantId] = useState<string>("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getFortnoxBureauClients()
      .then(setClients)
      .catch(() => {
        toast({ title: "Could not load bureau clients", variant: "destructive" });
      })
      .finally(() => setLoading(false));
  }, []);

  const handleConfirm = async () => {
    if (!selectedTenantId) return;
    setSaving(true);
    try {
      await selectFortnoxBureauClient(selectedTenantId);
      const name = clients.find((c) => c.tenant_id === selectedTenantId)?.company_name;
      toast({ title: "Bureau client selected", description: name ?? selectedTenantId });
      onSelected();
    } catch (e) {
      toast({ title: "Failed to select client", description: e instanceof Error ? e.message : "Error", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="border-[#8fe0ee]/50">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-[#0a5e6b]" />
          <CardTitle className="text-base">Select Fortnox client (byrå mode)</CardTitle>
        </div>
        <CardDescription>
          You connected as a bureau (service account). Select which client company to operate on behalf of.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        ) : clients.length === 0 ? (
          <p className="text-sm text-muted-foreground">No accessible clients found for this bureau account.</p>
        ) : (
          <>
            <Select value={selectedTenantId} onValueChange={setSelectedTenantId}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Select a client company…" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((c) => (
                  <SelectItem key={c.tenant_id} value={c.tenant_id} className="text-xs">
                    {c.company_name} ({c.tenant_id})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button size="sm" className="h-7 text-xs" disabled={!selectedTenantId || saving} onClick={handleConfirm}>
              {saving ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : null}
              Confirm selection
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}

// ── Fortnox-specific row (with bureau toggle) ──────────────────────────────

function FortnoxProviderRow({
  status,
  globalLoading,
  refreshAll,
}: {
  status: FortnoxStatusResponse | null;
  globalLoading: boolean;
  refreshAll: () => Promise<void>;
}) {
  const [bureauMode, setBureauMode] = useState(false);
  const [busy, setBusy] = useState(false);

  const connected = !!status?.connected;

  const handleConnect = async () => {
    setBusy(true);
    try {
      const url = await getFortnoxAuthorizationUrl({ returnTo: "/settings", serviceAccount: bureauMode });
      window.location.assign(url);
    } catch (err) {
      toast({
        title: "Could not connect Fortnox",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
      setBusy(false);
    }
  };

  const handleDisconnect = async () => {
    setBusy(true);
    try {
      await disconnectFortnox();
      await refreshAll();
      toast({ title: "Fortnox disconnected" });
    } catch (err) {
      toast({
        title: "Could not disconnect Fortnox",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setBusy(false);
    }
  };

  const bureauLabel = status?.bureau_client_tenant_id
    ? `Byrå · Client ${status.bureau_client_tenant_id}`
    : null;

  return (
    <div>
      <div className="flex items-center gap-4 px-4 py-3">
        <div className="flex size-9 shrink-0 items-center justify-center">
          <img src="/assets/logos/integrations/fortnox.png" alt="Fortnox" className="h-full w-full rounded-md object-contain" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium leading-none text-foreground">Fortnox</p>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {bureauLabel ? bureauLabel : "OAuth2 · Voucher export & supplier management"}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {globalLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : connected ? (
            <>
              <Badge variant="secondary" className="text-xs">
                {bureauLabel ? "Byrå" : "Connected"}
              </Badge>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive"
                disabled={busy}
                onClick={handleDisconnect}
              >
                {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : <><Plug className="mr-1 h-3 w-3" />Disconnect</>}
              </Button>
            </>
          ) : (
            <Button size="sm" className="h-7 text-xs" disabled={busy} onClick={handleConnect}>
              {busy ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : null}
              Connect
            </Button>
          )}
        </div>
      </div>
      {/* Bureau mode toggle — only shown when not yet connected */}
      {!connected && (
        <div className="flex items-center gap-2 border-t border-border bg-muted/20 px-4 py-2">
          <Switch
            id="fortnox-bureau-mode"
            checked={bureauMode}
            onCheckedChange={setBureauMode}
            className="scale-75"
          />
          <Label htmlFor="fortnox-bureau-mode" className="cursor-pointer text-xs text-muted-foreground">
            Connecting as a byrå (service account)
          </Label>
        </div>
      )}
    </div>
  );
}

// ── Provider configuration ─────────────────────────────────────────────────

const PROVIDERS: ProviderConfig[] = [
  {
    key: "fortnox",
    name: "Fortnox",
    description: "OAuth2 · Voucher export & supplier management",
    logo: "/assets/logos/integrations/fortnox.png",
    type: "oauth",
    onConnect: async () => {
      // Default connect — non-bureau. Bureau connect is handled in FortnoxProviderRow.
      const url = await getFortnoxAuthorizationUrl({ returnTo: "/settings" });
      window.location.assign(url);
    },
    onDisconnect: async (refresh) => { await disconnectFortnox(); await refresh(); },
  },
  {
    key: "visma",
    name: "Visma eAccounting",
    description: "OAuth2 · Voucher export",
    logo: "/assets/logos/integrations/visma.png",
    type: "oauth",
    onConnect: async () => {
      const url = await getVismaAuthorizationUrl({ returnTo: "/settings" });
      window.location.assign(url);
    },
    onDisconnect: async (refresh) => { await disconnectVisma(); await refresh(); },
  },
  {
    key: "bjornlunden",
    name: "Björn Lundén",
    description: "API credentials · Voucher export",
    logo: "/assets/logos/integrations/bjornlunden.webp",
    type: "credentials",
    fields: [
      { name: "client_id", label: "Client ID", placeholder: "bl_client_…" },
      { name: "client_secret", label: "Client Secret", type: "password", placeholder: "••••••••" },
      { name: "user_key", label: "User Key", placeholder: "Your BL user key" },
    ],
    onConnect: async (v, refresh) => {
      await connectBjornLunden({ client_id: v.client_id, client_secret: v.client_secret, user_key: v.user_key });
      await refresh();
    },
    onDisconnect: async (refresh) => { await disconnectBjornLunden(); await refresh(); },
  },
  {
    key: "briox",
    name: "Briox",
    description: "Application token · Voucher export",
    logo: "/assets/logos/integrations/briox.png",
    type: "credentials",
    fields: [
      { name: "application_token", label: "Application Token", type: "password", placeholder: "••••••••" },
    ],
    onConnect: async (v, refresh) => {
      await connectBriox({ application_token: v.application_token });
      await refresh();
    },
    onDisconnect: async (refresh) => { await disconnectBriox(); await refresh(); },
  },
  {
    key: "bokio",
    name: "Bokio",
    description: "API token · Voucher export",
    logo: "/assets/logos/integrations/bokio.png",
    type: "credentials",
    fields: [
      { name: "api_token", label: "API Token", type: "password", placeholder: "••••••••" },
      { name: "company_id", label: "Company ID", placeholder: "Your Bokio company UUID" },
    ],
    onConnect: async (v, refresh) => {
      await connectBokio({ api_token: v.api_token, company_id: v.company_id });
      await refresh();
    },
    onDisconnect: async (refresh) => { await disconnectBokio(); await refresh(); },
  },
  {
    key: "gmail",
    name: "Gmail",
    description: "OAuth2 · Email inbox document intake",
    logo: "/assets/logos/integrations/gmail.png",
    type: "oauth",
    onConnect: async () => {
      const url = await getGmailAuthorizationUrl({ returnTo: "/settings" });
      window.location.assign(url);
    },
    onDisconnect: async (refresh) => { await disconnectGmail(); await refresh(); },
  },
];

// ── Gmail sync section ────────────────────────────────────────────────────

function GmailSyncSection({ status }: { status: GmailStatusResponse }) {
  const [syncing, setSyncing] = useState(false);
  const [lastResult, setLastResult] = useState<string | null>(null);

  const handleSync = async (forceFull = false) => {
    setSyncing(true);
    setLastResult(null);
    try {
      const result = await triggerGmailSync(forceFull);
      setLastResult(result.message);
      toast({ title: "Email sync completed", description: result.message });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Sync failed";
      setLastResult(msg);
      toast({ title: "Sync failed", description: msg, variant: "destructive" });
    } finally {
      setSyncing(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-muted-foreground" />
          <CardTitle className="text-base">Gmail Email Sync</CardTitle>
          {status.schedule_enabled && (
            <Badge variant="secondary" className="text-xs">
              {status.schedule_type === "daily" ? "Daily" : "Custom"}
            </Badge>
          )}
        </div>
        <CardDescription>
          Automatically scan your inbox for invoices and receipts.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-muted-foreground">Emails processed:</span>{" "}
            <span className="font-medium">{status.total_emails_processed ?? 0}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Attachments extracted:</span>{" "}
            <span className="font-medium">{status.total_attachments_extracted ?? 0}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Last sync:</span>{" "}
            <span className="font-medium">
              {status.last_synced_at
                ? new Date(status.last_synced_at).toLocaleString()
                : "Never"}
            </span>
          </div>
        </div>

        {status.last_error && (
          <div className="flex items-start gap-2 rounded border border-destructive/30 bg-destructive/5 p-2 text-xs text-destructive">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            {status.last_error}
          </div>
        )}

        {lastResult && (
          <p className="text-xs text-muted-foreground">{lastResult}</p>
        )}

        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => handleSync(false)} disabled={syncing}>
            {syncing ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : <RefreshCw className="mr-1 h-3 w-3" />}
            Sync Now
          </Button>
          <Button size="sm" variant="ghost" onClick={() => handleSync(true)} disabled={syncing}>
            Full Rescan
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Telegram integration section ───────────────────────────────────────────

function TelegramSection() {
  const [status, setStatus] = useState<TelegramStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [botToken, setBotToken] = useState("");
  const [showTokenInput, setShowTokenInput] = useState(false);
  const [linkCode, setLinkCode] = useState<{ code: string; bot_username: string | null; expires_in: number } | null>(null);
  const [codeSecondsLeft, setCodeSecondsLeft] = useState(0);
  const [linkedUsers, setLinkedUsers] = useState<TelegramLinkedUser[]>([]);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const s = await getTelegramStatus();
      setStatus(s);
      if (s.connected) {
        const users = await getTelegramLinkedUsers();
        setLinkedUsers(users);
      }
    } catch {
      setStatus({ connected: false, bot_username: null, bot_name: null });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void fetchStatus(); }, []);

  // Countdown timer for link code
  useEffect(() => {
    if (!linkCode) return;
    setCodeSecondsLeft(linkCode.expires_in);
    const interval = setInterval(() => {
      setCodeSecondsLeft((s) => {
        if (s <= 1) { clearInterval(interval); setLinkCode(null); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [linkCode]);

  const handleConnect = async () => {
    if (!botToken.trim()) {
      toast({ title: "Bot token is required", variant: "destructive" });
      return;
    }
    setBusy(true);
    try {
      await connectTelegram(botToken.trim());
      toast({ title: "Telegram bot connected" });
      setBotToken("");
      setShowTokenInput(false);
      await fetchStatus();
    } catch (e) {
      toast({ title: "Connection failed", description: e instanceof Error ? e.message : "Unknown error", variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  const handleDisconnect = async () => {
    setBusy(true);
    try {
      await disconnectTelegram();
      toast({ title: "Telegram bot disconnected" });
      setStatus({ connected: false, bot_username: null, bot_name: null });
      setLinkedUsers([]);
      setLinkCode(null);
    } catch (e) {
      toast({ title: "Disconnect failed", description: e instanceof Error ? e.message : "Unknown error", variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  const handleGetLinkCode = async () => {
    setBusy(true);
    try {
      const result = await generateTelegramLinkCode();
      setLinkCode(result);
    } catch (e) {
      toast({ title: "Failed to generate code", description: e instanceof Error ? e.message : "Unknown error", variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <MessageCircle className="h-4 w-4 text-muted-foreground" />
          <CardTitle className="text-base">Telegram</CardTitle>
          {status?.connected && <Badge variant="secondary" className="text-xs">Connected</Badge>}
        </div>
        <CardDescription>
          Let employees photograph receipts and send them directly to a company Telegram bot.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        ) : status?.connected ? (
          <>
            <p className="text-sm text-muted-foreground">
              Connected as <span className="font-medium text-foreground">@{status.bot_username}</span>
              {status.bot_name ? ` (${status.bot_name})` : ""}
            </p>

            <div className="flex flex-wrap gap-2">
              <Button size="sm" onClick={handleGetLinkCode} disabled={busy}>
                {busy ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : null}
                Get Link Code
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-destructive border-destructive/40 hover:bg-destructive/10"
                onClick={handleDisconnect}
                disabled={busy}
              >
                <Plug className="mr-1.5 h-3.5 w-3.5" />
                Disconnect
              </Button>
            </div>

            {linkCode && (
              <div className="rounded-md border p-3 space-y-2 status-info">
                <p className="text-xs font-medium">
                  Share this code with the employee — expires in {codeSecondsLeft}s
                </p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 rounded bg-background px-2 py-1.5 text-sm font-mono font-bold border">
                    {linkCode.code}
                  </code>
                  <Button
                    size="icon"
                    variant="outline"
                    className="shrink-0"
                    onClick={() => {
                      navigator.clipboard.writeText(linkCode.code);
                      toast({ title: "Code copied" });
                    }}
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </div>
                {linkCode.bot_username && (
                  <p className="text-xs text-muted-foreground">
                    Employee sends: <code className="font-mono">/start {linkCode.code}</code> to @{linkCode.bot_username}
                  </p>
                )}
              </div>
            )}

            {linkedUsers.length > 0 && (
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Linked employees</p>
                <div className="rounded-md border divide-y text-xs">
                  {linkedUsers.map((u) => (
                    <div key={u.user_id} className="flex items-center justify-between px-3 py-2">
                      <span className="font-medium">{u.telegram_first_name || "—"}</span>
                      <span className="text-muted-foreground">
                        {u.telegram_username ? `@${u.telegram_username}` : `chat ${u.telegram_chat_id}`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            {!showTokenInput ? (
              <Button size="sm" onClick={() => setShowTokenInput(true)}>
                Connect Bot
              </Button>
            ) : (
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label className="text-xs" htmlFor="telegram-bot-token">Bot Token</Label>
                  <Input
                    id="telegram-bot-token"
                    type="password"
                    className="h-8 text-xs font-mono"
                    placeholder="123456789:ABCdef…"
                    value={botToken}
                    onChange={(e) => setBotToken(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Create a bot via{" "}
                    <a
                      className="underline"
                      href="https://t.me/BotFather"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      @BotFather
                    </a>{" "}
                    and paste the token here.
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleConnect} disabled={busy}>
                    {busy ? <><Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />Connecting…</> : "Save & Connect"}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => { setShowTokenInput(false); setBotToken(""); }}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

// ── Fortnox Sync section ──────────────────────────────────────────────────

function FortnoxSyncSection() {
  const [syncStatuses, setSyncStatuses] = useState<SyncStatusEntry[]>([]);
  const [resetting, setResetting] = useState(false);
  const [syncRequested, setSyncRequested] = useState(false);

  const syncing = syncRequested || syncStatuses.some((s) => s.status === "running");

  const fetchStatus = async () => {
    try {
      const data = await getFortnoxSyncStatus();
      setSyncStatuses(data);
      // Once we see a non-empty response with no running ops, sync is done
      if (data.length > 0 && !data.some((s) => s.status === "running")) {
        setSyncRequested(false);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  // Poll while syncing (includes syncRequested to catch the background task startup)
  useEffect(() => {
    if (!syncing) return;
    const interval = setInterval(fetchStatus, 3000);
    return () => clearInterval(interval);
  }, [syncing]);

  const handleSync = async () => {
    try {
      await startFortnoxSync();
      setSyncRequested(true);
      toast({ title: "Sync started", description: "Pulling data from Fortnox..." });
    } catch (err: unknown) {
      toast({ title: "Sync failed", description: err instanceof Error ? err.message : String(err), variant: "destructive" });
    }
  };

  const handleReset = async () => {
    setResetting(true);
    try {
      const result = await resetFortnoxData();
      toast({ title: "Fortnox data cleared", description: result.message });
      setSyncStatuses([]);
    } catch (err: unknown) {
      toast({ title: "Reset failed", description: err instanceof Error ? err.message : String(err), variant: "destructive" });
    } finally {
      setResetting(false);
    }
  };

  const fullSync = syncStatuses.find((s) => s.sync_type === "full");
  const hasSyncedData = syncStatuses.some((s) => s.status === "completed" && s.records_synced > 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">Fortnox Data Sync</CardTitle>
            <CardDescription>
              Pull chart of accounts, suppliers, and vouchers from Fortnox into
              the local ledger for faster pipeline processing.
            </CardDescription>
          </div>
          <div className="flex gap-2">
            {hasSyncedData && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={syncing || resetting}
                    className="text-destructive border-destructive/30 hover:bg-destructive/10"
                  >
                    {resetting ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="mr-2 h-4 w-4" />
                    )}
                    {resetting ? "Clearing..." : "Clear & Re-sync"}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Clear all Fortnox data?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will delete all data imported from Fortnox — vouchers,
                      suppliers, customers, invoices, chart of accounts, projects,
                      and cost centers. Your Fortnox connection will remain active
                      so you can re-sync immediately after.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleReset} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      Clear Fortnox data
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            <Button
              onClick={handleSync}
              disabled={syncing || resetting}
              size="sm"
            >
              {syncing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              {syncing ? "Syncing..." : "Sync from Fortnox"}
            </Button>
          </div>
        </div>
      </CardHeader>
      {syncStatuses.length > 0 && (
        <CardContent>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {syncStatuses
              .filter((s) => s.sync_type !== "full")
              .map((s) => (
                <div key={s.sync_type} className="flex items-center justify-between rounded-md border px-3 py-2">
                  <span className="capitalize">{s.sync_type.replace("_", " ")}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">{s.records_synced} records</span>
                    {s.status === "completed" && <Check className="h-4 w-4 text-[#2a7a0f]" />}
                    {s.status === "running" && <Loader2 className="h-4 w-4 animate-spin text-[#0a5e6b]" />}
                    {s.status === "failed" && <AlertCircle className="h-4 w-4 text-destructive" />}
                  </div>
                </div>
              ))}
          </div>
          {fullSync?.completed_at && (
            <p className="mt-2 text-xs text-muted-foreground">
              Last sync: {new Date(fullSync.completed_at).toLocaleString()}
            </p>
          )}
        </CardContent>
      )}
    </Card>
  );
}

// ── Main SettingsView ──────────────────────────────────────────────────────

const SettingsView = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { activeCompany } = useCompany();

  const [statuses, setStatuses] = useState<AllStatuses>({
    fortnox: null, visma: null, bjornlunden: null, briox: null, bokio: null, gmail: null,
  });
  const [loading, setLoading] = useState(true);

  // MCP key state
  const [mcpHasKey, setMcpHasKey] = useState(false);
  const [mcpNewKey, setMcpNewKey] = useState<string | null>(null);
  const [mcpLoading, setMcpLoading] = useState(false);

  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);

  const refreshAll = async () => {
    setLoading(true);
    try {
      const [fortnox, visma, bjornlunden, briox, bokio, gmail] = await Promise.allSettled([
        getFortnoxStatus(), getVismaStatus(), getBjornLundenStatus(), getBrioxStatus(), getBokioStatus(), getGmailStatus(),
      ]);
      setStatuses({
        fortnox: fortnox.status === "fulfilled" ? fortnox.value : null,
        visma: visma.status === "fulfilled" ? visma.value : null,
        bjornlunden: bjornlunden.status === "fulfilled" ? bjornlunden.value : null,
        briox: briox.status === "fulfilled" ? briox.value : null,
        bokio: bokio.status === "fulfilled" ? bokio.value : null,
        gmail: gmail.status === "fulfilled" ? gmail.value : null,
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshMcpStatus = async () => {
    if (!activeCompany) return;
    try {
      const s = await getMcpKeyStatus(activeCompany.id);
      setMcpHasKey(s.has_key);
    } catch { /* ignore */ }
  };

  const handleGenerateMcpKey = async () => {
    if (!activeCompany) return;
    setMcpLoading(true);
    try {
      const result = await generateMcpKey(activeCompany.id);
      setMcpHasKey(true);
      setMcpNewKey(result.api_key);
      toast({ title: "MCP API key generated", description: "Copy and save it now — it won't be shown again." });
    } catch (e) {
      toast({ title: "Failed to generate key", description: e instanceof Error ? e.message : "Error", variant: "destructive" });
    } finally {
      setMcpLoading(false);
    }
  };

  const handleRevokeMcpKey = async () => {
    if (!activeCompany) return;
    setMcpLoading(true);
    try {
      await revokeMcpKey(activeCompany.id);
      setMcpHasKey(false);
      setMcpNewKey(null);
      toast({ title: "MCP API key revoked" });
    } catch (e) {
      toast({ title: "Failed to revoke key", description: e instanceof Error ? e.message : "Error", variant: "destructive" });
    } finally {
      setMcpLoading(false);
    }
  };

  const [showBureauClientSelection, setShowBureauClientSelection] = useState(false);

  useEffect(() => {
    const oauthProviders = ["fortnox", "visma"] as const;
    let found = false;
    for (const p of oauthProviders) {
      const val = searchParams.get(p);
      const reason = searchParams.get("reason");
      const isBureau = p === "fortnox" && searchParams.get("bureau") === "1";
      if (val === "connected") {
        if (isBureau) {
          setShowBureauClientSelection(true);
          toast({ title: "Fortnox bureau account connected", description: "Now select which client company to operate on behalf of." });
        } else {
          toast({ title: `${p.charAt(0).toUpperCase() + p.slice(1)} connected`, description: "Your account is now linked." });
        }
        found = true;
      } else if (val === "error") {
        toast({ title: `${p} connection failed`, description: reason || "OAuth authorization failed.", variant: "destructive" });
        found = true;
      }
    }
    if (found) {
      navigate("/settings", { replace: true });
      if (activeCompany?.id) void refreshAll();
    }
   
  }, [navigate, searchParams, activeCompany?.id]);

  // Reload statuses whenever the active company changes (including on initial
  // page load after an OAuth redirect, when CompanyContext resolves async).
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (activeCompany?.id) { void refreshAll(); refreshMcpStatus(); } }, [activeCompany?.id]);

  const apiBase = runtimeConfig.apiBaseUrl.replace(/\/$/, "");
  const mcpUrl = apiBase ? `${apiBase}/mcp` : window.location.origin.replace("5173", "8000") + "/mcp";

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Connect an accounting integration to enable voucher export.
        </p>
      </div>

      {showBureauClientSelection && (
        <FortnoxBureauSelectionCard
          onSelected={() => {
            setShowBureauClientSelection(false);
            void refreshAll();
          }}
        />
      )}

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Accounting integrations</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {PROVIDERS.map((provider, i) => (
            <div key={provider.key}>
              {i > 0 && <Separator />}
              {provider.key === "fortnox" ? (
                <FortnoxProviderRow
                  status={statuses.fortnox}
                  globalLoading={loading}
                  refreshAll={refreshAll}
                />
              ) : (
                <ProviderRow
                  config={provider}
                  status={statuses[provider.key]}
                  globalLoading={loading}
                  refreshAll={refreshAll}
                />
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Fortnox Sync — only when Fortnox is connected */}
      {statuses.fortnox?.connected && <FortnoxSyncSection />}

      {/* Gmail Sync — only when Gmail is connected */}
      {statuses.gmail?.connected && <GmailSyncSection status={statuses.gmail} />}

      {/* Telegram */}
      <TelegramSection />

      {/* MCP API Key */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-base">MCP Integration</CardTitle>
            {mcpHasKey && <Badge variant="secondary" className="text-xs">Active</Badge>}
          </div>
          <CardDescription>
            Use an MCP API key to connect Claude Desktop (or any MCP client) directly to your
            {activeCompany ? ` ${activeCompany.name}` : ""} accounting data.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {mcpNewKey && (
            <div className="rounded-md border p-3 status-warning">
              <div className="flex items-start gap-2 mb-2">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <p className="text-xs font-medium">
                  Save this key now — it will not be shown again.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <code className="flex-1 rounded bg-background px-2 py-1.5 text-xs font-mono break-all border">
                  {mcpNewKey}
                </code>
                <Button
                  size="icon"
                  variant="outline"
                  className="shrink-0"
                  onClick={() => {
                    navigator.clipboard.writeText(mcpNewKey);
                    toast({ title: "Copied to clipboard" });
                  }}
                >
                  <Copy className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )}

          {mcpHasKey && !mcpNewKey && (
            <p className="text-sm text-muted-foreground">
              An MCP API key is active for this company. Generate a new one to rotate it (the old
              key will be invalidated immediately).
            </p>
          )}

          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleGenerateMcpKey}
              disabled={mcpLoading || !activeCompany}
            >
              {mcpLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : <KeyRound className="h-3.5 w-3.5 mr-1.5" />}
              {mcpHasKey ? "Rotate key" : "Generate key"}
            </Button>
            {mcpHasKey && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleRevokeMcpKey}
                disabled={mcpLoading}
                className="text-destructive border-destructive/40 hover:bg-destructive/10"
              >
                <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                Revoke
              </Button>
            )}
          </div>

          {/* Claude Desktop config snippet */}
          <details className="group">
            <summary className="cursor-pointer text-xs text-muted-foreground select-none hover:text-foreground transition-colors">
              Claude Desktop config snippet
            </summary>
            <pre className="mt-2 rounded-md bg-muted p-3 text-xs overflow-x-auto">
{`{
  "mcpServers": {
    "igdrasil-accounting": {
      "type": "http",
      "url": "${mcpUrl}",
      "headers": {
        "X-MCP-API-Key": "<your-key-here>"
      }
    }
  }
}`}
            </pre>
          </details>
        </CardContent>
      </Card>

      {/* AI Token Usage */}
      <TokenUsageCard />
    </div>
  );
};

export default SettingsView;
