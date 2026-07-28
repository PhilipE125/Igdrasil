import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { authenticatedApiRequest } from "@/lib/uploadApi";
import { CreditCard, Plus, Trash2, Pencil } from "lucide-react";

interface CardRule {
  id: string;
  card_last_four: string;
  card_brand: string | null;
  person_name: string | null;
  credit_account: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export function CardRulesView() {
  const [rules, setRules] = useState<CardRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<{
    card_brand: string; person_name: string; credit_account: string; notes: string;
  }>({ card_brand: "", person_name: "", credit_account: "", notes: "" });
  const [formData, setFormData] = useState({
    card_last_four: "",
    card_brand: "",
    person_name: "",
    credit_account: "1930",
    notes: "",
  });

  const fetchRules = async () => {
    try {
      const data = await authenticatedApiRequest<CardRule[]>("/card-rules");
      setRules(data);
    } catch (err) {
      toast({ title: "Error", description: "Failed to load card rules", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRules(); }, []);

  const handleCreate = async () => {
    try {
      await authenticatedApiRequest<CardRule>("/card-rules", {
        method: "POST",
        body: JSON.stringify({
          card_last_four: formData.card_last_four,
          card_brand: formData.card_brand || null,
          person_name: formData.person_name || null,
          credit_account: parseInt(formData.credit_account, 10),
          notes: formData.notes || null,
        }),
      });
      toast({ title: "Card rule created" });
      setShowForm(false);
      setFormData({ card_last_four: "", card_brand: "", person_name: "", credit_account: "1930", notes: "" });
      fetchRules();
    } catch (err: unknown) {
      toast({ title: "Error", description: (err as Error).message, variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await authenticatedApiRequest(`/card-rules/${id}`, { method: "DELETE" });
      toast({ title: "Card rule deleted" });
      fetchRules();
    } catch (err: unknown) {
      toast({ title: "Error", description: (err as Error).message, variant: "destructive" });
    }
  };

  const startEdit = (rule: CardRule) => {
    setEditingId(rule.id);
    setEditData({
      card_brand: rule.card_brand ?? "",
      person_name: rule.person_name ?? "",
      credit_account: String(rule.credit_account),
      notes: rule.notes ?? "",
    });
  };

  const handleUpdate = async () => {
    if (!editingId) return;
    try {
      await authenticatedApiRequest(`/card-rules/${editingId}`, {
        method: "PUT",
        body: JSON.stringify({
          card_brand: editData.card_brand || null,
          person_name: editData.person_name || null,
          credit_account: parseInt(editData.credit_account, 10),
          notes: editData.notes || null,
        }),
      });
      toast({ title: "Card rule updated" });
      setEditingId(null);
      fetchRules();
    } catch (err: unknown) {
      toast({ title: "Error", description: (err as Error).message, variant: "destructive" });
    }
  };

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Card Rules</h1>
          <p className="text-muted-foreground">
            Map payment cards to credit accounts for automatic receipt booking.
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Rule
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>New Card Rule</CardTitle>
            <CardDescription>
              When a receipt shows these last 4 digits, the pipeline will credit the specified account instead of 2440.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="last4">Last 4 Digits</Label>
                <Input
                  id="last4"
                  maxLength={4}
                  placeholder="1234"
                  value={formData.card_last_four}
                  onChange={(e) => setFormData({ ...formData, card_last_four: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="brand">Card Brand</Label>
                <Input
                  id="brand"
                  placeholder="Visa, Mastercard..."
                  value={formData.card_brand}
                  onChange={(e) => setFormData({ ...formData, card_brand: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="person">Person Name</Label>
                <Input
                  id="person"
                  placeholder="Card holder name"
                  value={formData.person_name}
                  onChange={(e) => setFormData({ ...formData, person_name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="account">Credit Account</Label>
                <Input
                  id="account"
                  type="number"
                  placeholder="1930"
                  value={formData.credit_account}
                  onChange={(e) => setFormData({ ...formData, credit_account: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Input
                id="notes"
                placeholder="Optional notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreate}>Create</Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : rules.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-12 text-center">
            <CreditCard className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No card rules yet</h3>
            <p className="text-muted-foreground mt-1">
              Add a card rule to automate receipt credit account mapping.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {rules.map((rule) => (
            <Card key={rule.id}>
              <CardContent className="py-4">
                {editingId === rule.id ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5 text-muted-foreground shrink-0" />
                      <span className="font-mono font-medium">****{rule.card_last_four}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">Card Brand</Label>
                        <Input className="h-8 text-sm" value={editData.card_brand}
                          onChange={(e) => setEditData({ ...editData, card_brand: e.target.value })} />
                      </div>
                      <div>
                        <Label className="text-xs">Person Name</Label>
                        <Input className="h-8 text-sm" value={editData.person_name}
                          onChange={(e) => setEditData({ ...editData, person_name: e.target.value })} />
                      </div>
                      <div>
                        <Label className="text-xs">Credit Account</Label>
                        <Input className="h-8 text-sm" type="number" value={editData.credit_account}
                          onChange={(e) => setEditData({ ...editData, credit_account: e.target.value })} />
                      </div>
                      <div>
                        <Label className="text-xs">Notes</Label>
                        <Input className="h-8 text-sm" value={editData.notes}
                          onChange={(e) => setEditData({ ...editData, notes: e.target.value })} />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleUpdate}>Save</Button>
                      <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>Cancel</Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <CreditCard className="h-8 w-8 text-muted-foreground" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-lg">****{rule.card_last_four}</span>
                          {rule.card_brand && <Badge variant="secondary">{rule.card_brand}</Badge>}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {rule.person_name && <span>{rule.person_name} &middot; </span>}
                          Credit account: <span className="font-mono">{rule.credit_account}</span>
                          {rule.notes && <span> &middot; {rule.notes}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" aria-label="Edit rule" onClick={() => startEdit(rule)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" aria-label="Delete rule" onClick={() => handleDelete(rule.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
