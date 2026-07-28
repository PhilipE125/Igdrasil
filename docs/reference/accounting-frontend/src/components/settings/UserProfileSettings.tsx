import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";
import { authenticatedApiRequest, getAuthToken } from "@/lib/uploadApi";
import { runtimeConfig } from "@/lib/runtimeConfig";
import { AlertTriangle, Download, LogOut, Pencil, Trash2 } from "lucide-react";

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 10; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

export function UserProfileSettings() {
  const { user, profile, updateProfile, signOut } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [legalEntityName, setLegalEntityName] = useState("");
  const [businessDescription, setBusinessDescription] = useState("");

  // Delete account state
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletionInfo, setDeletionInfo] = useState<{
    deletable_companies: string[];
    shared_companies: string[];
  } | null>(null);
  const [checklist, setChecklist] = useState({ exported: false, ledger: false, audit: false });
  const [confirmCode, setConfirmCode] = useState(generateCode);
  const [typedCode, setTypedCode] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [exporting, setExporting] = useState(false);

  const allChecked = checklist.exported && checklist.ledger && checklist.audit;
  const codeMatch = typedCode.toUpperCase() === confirmCode;
  const canDelete = allChecked && codeMatch;

  useEffect(() => {
    if (deleteOpen) {
      authenticatedApiRequest<{
        deletable_companies: string[];
        shared_companies: string[];
      }>("/users/me/deletion-info").then(setDeletionInfo).catch((err) => {
        toast({ title: "Fel", description: "Kunde inte hämta kontoinformation.", variant: "destructive" });
      });
      setTypedCode("");
      setChecklist({ exported: false, ledger: false, audit: false });
      setConfirmCode(generateCode());
    }
  }, [deleteOpen]);

  const startEdit = () => {
    setLegalEntityName(profile?.legal_entity_name ?? "");
    setBusinessDescription(profile?.business_description ?? "");
    setEditing(true);
  };

  const save = async () => {
    if (!legalEntityName.trim()) {
      toast({ title: "Obligatoriskt", description: "Företagsnamn krävs.", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      await updateProfile({
        legal_entity_name: legalEntityName.trim(),
        business_description: businessDescription.trim() || null,
      });
      toast({ title: "Sparat" });
      setEditing(false);
    } catch (err: unknown) {
      toast({ title: "Fel", description: err instanceof Error ? err.message : "Okänt fel.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const token = await getAuthToken();
      const apiBase = runtimeConfig.apiBaseUrl.replace(/\/$/, "");
      const response = await fetch(`${apiBase}/users/me/export`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Export misslyckades");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `igdrasil_export_${user?.email?.split("@")[0] ?? "data"}.zip`;
      a.click();
      URL.revokeObjectURL(url);
      setChecklist((c) => ({ ...c, exported: true, ledger: true, audit: true }));
      toast({ title: "Export klar", description: "Zip-filen har laddats ner." });
    } catch (err) {
      toast({ title: "Fel", description: err instanceof Error ? err.message : "Kunde inte exportera.", variant: "destructive" });
    } finally {
      setExporting(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await authenticatedApiRequest("/users/me", {
        method: "DELETE",
        body: JSON.stringify({ confirmation_code: typedCode }),
      });
      toast({ title: "Kontot har raderats" });
      signOut();
    } catch (err) {
      toast({ title: "Fel", description: err instanceof Error ? err.message : "Kunde inte radera.", variant: "destructive" });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Användarprofil</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Hantera ditt konto och personliga uppgifter.
        </p>
      </div>

      {/* Account info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Konto</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">E-post</p>
              <p className="font-medium">{user?.email ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Konto skapat</p>
              <p className="font-medium">
                {user?.created_at ? new Date(user.created_at).toLocaleDateString("sv-SE") : "—"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile details */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">Profiluppgifter</CardTitle>
            <CardDescription>Företagsnamn och verksamhetsbeskrivning</CardDescription>
          </div>
          {!editing && (
            <Button variant="outline" size="sm" className="gap-1" onClick={startEdit}>
              <Pencil className="h-3 w-3" /> Redigera
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {editing ? (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="legal-entity-name">Företagsnamn *</Label>
                <Input id="legal-entity-name" value={legalEntityName} onChange={(e) => setLegalEntityName(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="business-description">Verksamhetsbeskrivning</Label>
                <Textarea id="business-description" value={businessDescription} onChange={(e) => setBusinessDescription(e.target.value)} rows={3} />
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={save} disabled={saving}>{saving ? "Sparar…" : "Spara"}</Button>
                <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>Avbryt</Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Företagsnamn</p>
                <p className="font-medium">{profile?.legal_entity_name || <span className="italic text-muted-foreground/50">Ej angivet</span>}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Beskrivning</p>
                <p className="font-medium">{profile?.business_description || <span className="italic text-muted-foreground/50">Ej angivet</span>}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Button variant="outline" size="sm" onClick={() => signOut()} className="gap-2">
        <LogOut className="h-3.5 w-3.5" /> Logga ut
      </Button>

      {/* ── Danger zone ── */}
      <Separator />

      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="text-base text-destructive flex items-center gap-2">
            <AlertTriangle className="size-4" />
            Riskzon
          </CardTitle>
          <CardDescription>
            Radera ditt konto och all tillhörande data permanent. Detta kan inte ångras.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm" className="gap-2">
                <Trash2 className="size-3.5" />
                Radera mitt konto
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="max-w-lg">
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="size-5" />
                  Radera konto permanent
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Detta raderar ditt konto, all bokföringsdata, dokument, och granskningslogg. Åtgärden kan inte ångras.
                </AlertDialogDescription>
              </AlertDialogHeader>

              <div className="space-y-4">
                {/* What gets deleted */}
                {deletionInfo && (
                  <div className="rounded-md border p-3 text-sm space-y-1">
                    {deletionInfo.deletable_companies.length > 0 && (
                      <p>
                        <span className="font-medium text-destructive">Raderas:</span>{" "}
                        {deletionInfo.deletable_companies.join(", ")}
                      </p>
                    )}
                    {deletionInfo.shared_companies.length > 0 && (
                      <p>
                        <span className="font-medium">Lämnas (delade):</span>{" "}
                        {deletionInfo.shared_companies.join(", ")}
                      </p>
                    )}
                  </div>
                )}

                {/* Step 1: Download export */}
                <div className="space-y-3">
                  <p className="text-sm font-medium">Steg 1: Ladda ner din data</p>
                  <Button variant="outline" size="sm" className="gap-2 w-full" onClick={handleExport} disabled={exporting}>
                    <Download className="size-3.5" />
                    {exporting ? "Exporterar…" : "Ladda ner all data (ZIP)"}
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Zip-filen innehåller alla dokument, huvudbok (CSV) och granskningslogg (JSON).
                  </p>
                </div>

                {/* Step 2: Checklist */}
                <div className="space-y-2">
                  <p className="text-sm font-medium">Steg 2: Bekräfta att du laddat ner</p>
                  <label className="flex items-center gap-2.5 text-sm">
                    <Checkbox checked={checklist.exported} onCheckedChange={(v) => setChecklist((c) => ({ ...c, exported: !!v }))} />
                    Jag har laddat ner alla uppladdade dokument
                  </label>
                  <label className="flex items-center gap-2.5 text-sm">
                    <Checkbox checked={checklist.ledger} onCheckedChange={(v) => setChecklist((c) => ({ ...c, ledger: !!v }))} />
                    Jag har laddat ner huvudboken (ledger)
                  </label>
                  <label className="flex items-center gap-2.5 text-sm">
                    <Checkbox checked={checklist.audit} onCheckedChange={(v) => setChecklist((c) => ({ ...c, audit: !!v }))} />
                    Jag har laddat ner granskningsloggen (audit trail)
                  </label>
                </div>

                {/* Step 3: Type confirmation code */}
                <div className="space-y-2">
                  <p className="text-sm font-medium">Steg 3: Skriv bekräftelsekoden</p>
                  <p className="text-xs text-muted-foreground">
                    Skriv <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-destructive font-bold">{confirmCode}</code> för att bekräfta radering.
                  </p>
                  <Input
                    value={typedCode}
                    onChange={(e) => setTypedCode(e.target.value.toUpperCase())}
                    placeholder="Skriv koden här..."
                    className="font-mono tracking-widest text-center"
                    maxLength={10}
                    disabled={!allChecked}
                  />
                </div>
              </div>

              <AlertDialogFooter>
                <AlertDialogCancel>Avbryt</AlertDialogCancel>
                <Button variant="destructive" onClick={handleDelete} disabled={!canDelete || deleting}>
                  {deleting ? "Raderar…" : "Radera mitt konto permanent"}
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}
