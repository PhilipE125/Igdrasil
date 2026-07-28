import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { ProfileGroup } from "@/components/profile/ProfileGroup";
import { ProfileRow } from "@/components/profile/ProfileRow";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Pencil, LogOut } from "lucide-react";

const ProfileView = () => {
  const { user, profile, updateProfile, signOut } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [legalEntityName, setLegalEntityName] = useState("");
  const [businessDescription, setBusinessDescription] = useState("");

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
      const message = err instanceof Error ? err.message : "Ett oväntat fel uppstod.";
      toast({ title: "Fel", description: message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const empty = <span className="italic text-muted-foreground/50">Ej angivet</span>;

  return (
    <div className="mx-auto max-w-xl space-y-8 p-6">
      <h1 className="text-xl font-semibold text-foreground">Profil</h1>

      {/* Account */}
      <ProfileGroup title="Konto">
        <ProfileRow label="E-post">{user?.email ?? empty}</ProfileRow>
        <ProfileRow label="Skapat">
          {user?.created_at ? new Date(user.created_at).toLocaleDateString("sv-SE") : empty}
        </ProfileRow>
      </ProfileGroup>

      {/* Company */}
      <ProfileGroup
        title="Företag"
        action={
          !editing ? (
            <Button variant="ghost" size="sm" className="gap-1" onClick={startEdit}>
              <Pencil className="h-3 w-3" aria-hidden="true" /> Redigera
            </Button>
          ) : undefined
        }
      >
        {editing ? (
          <div className="py-4 space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="legal-entity-name" className="text-xs text-muted-foreground">Företagsnamn *</label>
              <Input id="legal-entity-name" name="legalEntityName" autoComplete="organization" value={legalEntityName} onChange={(e) => setLegalEntityName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="business-description" className="text-xs text-muted-foreground">Verksamhetsbeskrivning</label>
              <Textarea id="business-description" name="businessDescription" value={businessDescription} onChange={(e) => setBusinessDescription(e.target.value)} rows={3} />
            </div>
            <div className="flex gap-2 pt-1">
              <Button size="sm" onClick={save} disabled={saving}>
                {saving ? "Sparar…" : "Spara"}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>
                Avbryt
              </Button>
            </div>
          </div>
        ) : (
          <>
            <ProfileRow label="Företagsnamn">{profile?.legal_entity_name || empty}</ProfileRow>
            <ProfileRow label="Beskrivning">{profile?.business_description || empty}</ProfileRow>
          </>
        )}
      </ProfileGroup>

      {/* Sign out */}
      <Button variant="outline" size="sm" onClick={() => signOut()} className="gap-2">
        <LogOut className="h-3.5 w-3.5" aria-hidden="true" /> Logga ut
      </Button>
    </div>
  );
};

export default ProfileView;
