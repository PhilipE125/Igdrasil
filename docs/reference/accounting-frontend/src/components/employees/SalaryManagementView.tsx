import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, FileText, Download, Loader2, Mail, Send, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableToolbar,
  TableToolbarSearch,
  TableToolbarTabs,
} from "@/components/ui/table";
import {
  getSalaryOverview,
  createWagePeriod,
  parseWageText,
  generatePayslip,
  generateDeclaration,
  getPayslipEmailPreview,
  type SalaryOverview,
  type EmployeeWageStatus,
  type PayslipEmailPreview,
} from "@/lib/employeeApi";
import { toast } from "@/hooks/use-toast";

const MONTHS = [
  { value: 1, label: "Januari" },
  { value: 2, label: "Februari" },
  { value: 3, label: "Mars" },
  { value: 4, label: "April" },
  { value: 5, label: "Maj" },
  { value: 6, label: "Juni" },
  { value: 7, label: "Juli" },
  { value: 8, label: "Augusti" },
  { value: 9, label: "September" },
  { value: 10, label: "Oktober" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
];

interface SalaryManagementViewProps {
  onBack: () => void;
}

export function SalaryManagementView({ onBack }: SalaryManagementViewProps) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [overview, setOverview] = useState<SalaryOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [rawTexts, setRawTexts] = useState<Record<string, string>>({});
  const [busyIds, setBusyIds] = useState<Set<string>>(new Set());
  const [declarationLoading, setDeclarationLoading] = useState(false);
  const [emailPreview, setEmailPreview] = useState<PayslipEmailPreview | null>(null);
  const [emailPreviewOpen, setEmailPreviewOpen] = useState(false);
  const [pendingPayslipEmp, setPendingPayslipEmp] = useState<EmployeeWageStatus | null>(null);
  const [search, setSearch] = useState("");

  const fetchOverview = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getSalaryOverview(year, month);
      setOverview(data);
      const texts: Record<string, string> = {};
      for (const e of data.employees) {
        texts[e.employee_id] = e.wage_period?.raw_input_text || "";
      }
      setRawTexts(texts);
    } catch {
      toast({ title: "Fel", description: "Kunde inte hämta löneöversikt", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [year, month]);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  const filteredEmployees = useMemo(() => {
    const employees = overview?.employees ?? [];
    const term = search.trim().toLowerCase();
    if (!term) return employees;
    return employees.filter((employee) =>
      [
        employee.first_name,
        employee.last_name,
        employee.salary_type ?? "",
        employee.status,
      ].some((value) => value.toLowerCase().includes(term)),
    );
  }, [overview?.employees, search]);

  function addBusy(id: string) {
    setBusyIds((s) => new Set(s).add(id));
  }
  function removeBusy(id: string) {
    setBusyIds((s) => {
      const n = new Set(s);
      n.delete(id);
      return n;
    });
  }

  async function handleParse(emp: EmployeeWageStatus) {
    const text = rawTexts[emp.employee_id];
    if (!text?.trim()) return;

    addBusy(emp.employee_id);
    try {
      // Ensure wage period exists
      let wp = emp.wage_period;
      if (!wp) {
        wp = await createWagePeriod(emp.employee_id, {
          period_year: year,
          period_month: month,
          raw_input_text: text,
        });
      } else {
        // Update raw text
        await createWagePeriod(emp.employee_id, {
          period_year: year,
          period_month: month,
          raw_input_text: text,
        });
      }

      await parseWageText(emp.employee_id, wp.id);
      toast({ title: "Tolkat", description: `Lönedata tolkad för ${emp.first_name}` });
      await fetchOverview();
    } catch {
      toast({ title: "Fel", description: "Kunde inte tolka texten", variant: "destructive" });
    } finally {
      removeBusy(emp.employee_id);
    }
  }

  async function handlePayslipPreview(emp: EmployeeWageStatus) {
    if (!emp.wage_period) return;
    try {
      const preview = await getPayslipEmailPreview(year, month);
      setEmailPreview(preview);
      setPendingPayslipEmp(emp);
      setEmailPreviewOpen(true);
    } catch {
      // If preview fails, still allow sending without preview
      await sendPayslip(emp);
    }
  }

  async function sendPayslip(emp: EmployeeWageStatus) {
    if (!emp.wage_period) return;
    setEmailPreviewOpen(false);
    addBusy(emp.employee_id);
    try {
      const result = await generatePayslip(emp.employee_id, emp.wage_period.id);
      const emailMsg = result.email_sent
        ? ` och e-postad till ${result.recipient_email}`
        : "";
      toast({ title: "Lönespec skapad", description: `PDF genererad${emailMsg}` });
      await fetchOverview();
    } catch {
      toast({ title: "Fel", description: "Kunde inte skapa lönespec", variant: "destructive" });
    } finally {
      removeBusy(emp.employee_id);
      setPendingPayslipEmp(null);
    }
  }

  async function handleDeclaration() {
    setDeclarationLoading(true);
    try {
      await generateDeclaration(year, month);
      toast({ title: "Arbetsgivardeklaration genererad", description: "XML-filen är redo för nedladdning" });

      // Download it
      const response = await fetch(
        `/api/employees/employer-declaration/${year}/${month}/download`,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } },
      );
      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Arbetsgivardeklaration_${year}${String(month).padStart(2, "0")}.xml`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Okänt fel";
      toast({ title: "Fel", description: msg, variant: "destructive" });
    } finally {
      setDeclarationLoading(false);
    }
  }

  function statusBadge(emp: EmployeeWageStatus) {
    const wp = emp.wage_period;
    if (!wp) return <Badge variant="outline">Saknas</Badge>;
    if (wp.status === "confirmed") return <Badge className="bg-green-100 text-green-700 border-green-200">Bekräftad</Badge>;
    if (wp.status === "sent") return <Badge className="bg-blue-100 text-blue-700 border-blue-200">Skickad</Badge>;
    return <Badge variant="secondary">Utkast</Badge>;
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-lg font-semibold">Hantera Löner</h2>
        </div>

        <div className="flex items-center gap-3">
          {/* Period selector */}
          <Select value={String(month)} onValueChange={(v) => setMonth(Number(v))}>
            <SelectTrigger className="w-[130px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MONTHS.map((m) => (
                <SelectItem key={m.value} value={String(m.value)}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
            <SelectTrigger className="w-[90px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[year - 1, year, year + 1].map((y) => (
                <SelectItem key={y} value={String(y)}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Declaration button */}
          <Button
            variant="outline"
            disabled={!overview?.all_confirmed || declarationLoading}
            onClick={handleDeclaration}
            title={overview?.all_confirmed ? "Generera arbetsgivardeklaration" : "Alla anställda måste ha bekräftad lön"}
          >
            {declarationLoading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <FileText className="h-4 w-4 mr-2" />
            )}
            Arbetsgivardeklaration
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto p-4">
        {loading ? (
          <div className="flex items-center justify-center h-40 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            Laddar...
          </div>
        ) : !overview || overview.employees.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            Inga anställda hittade. Lägg till anställda först.
          </div>
        ) : (
          <div className="space-y-0">
          <TableToolbar className="rounded-b-none">
            <TableToolbarTabs>
              <TableToolbarSearch>
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Sök anställd eller status"
                  className="w-full"
                />
              </TableToolbarSearch>
            </TableToolbarTabs>
            <span className="text-xs text-muted-foreground">{filteredEmployees.length} rader</span>
          </TableToolbar>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[160px]">Anställd</TableHead>
                <TableHead className="w-[80px]">Lönetyp</TableHead>
                <TableHead>Löneinformation (klistra in text)</TableHead>
                <TableHead className="w-[90px]">Brutto</TableHead>
                <TableHead className="w-[90px]">Netto</TableHead>
                <TableHead className="w-[90px]">Status</TableHead>
                <TableHead className="w-[180px]">Åtgärder</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.map((emp) => {
                const busy = busyIds.has(emp.employee_id);
                return (
                  <TableRow key={emp.employee_id}>
                    <TableCell className="font-medium">
                      {emp.first_name} {emp.last_name}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {emp.salary_type === "hourly" ? "Tim" : emp.salary_type === "monthly" ? "Månad" : "–"}
                    </TableCell>
                    <TableCell>
                      <Textarea
                        placeholder="Klistra in timmar, datum, uppgifter..."
                        rows={2}
                        className="text-xs"
                        value={rawTexts[emp.employee_id] || ""}
                        onChange={(e) =>
                          setRawTexts((prev) => ({
                            ...prev,
                            [emp.employee_id]: e.target.value,
                          }))
                        }
                      />
                    </TableCell>
                    <TableCell className="text-sm tabular-nums">
                      {emp.wage_period?.gross_pay?.toLocaleString("sv-SE") ?? "–"}
                    </TableCell>
                    <TableCell className="text-sm tabular-nums">
                      {emp.wage_period?.net_pay?.toLocaleString("sv-SE") ?? "–"}
                    </TableCell>
                    <TableCell>{statusBadge(emp)}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={busy || !rawTexts[emp.employee_id]?.trim()}
                          onClick={() => handleParse(emp)}
                        >
                          {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : "Tolka"}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={busy || !emp.wage_period?.gross_pay}
                          onClick={() => handlePayslipPreview(emp)}
                          title="Skicka lönespecifikation"
                        >
                          {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          </div>
        )}
      </div>

      {/* Email confirmation dialog */}
      <Dialog open={emailPreviewOpen} onOpenChange={setEmailPreviewOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Skicka lönespecifikation
            </DialogTitle>
          </DialogHeader>

          {emailPreview && pendingPayslipEmp && (
            <div className="space-y-4">
              {/* Sender */}
              <div className="rounded-lg border p-3 space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Avsändare</p>
                {emailPreview.sender_configured ? (
                  <p className="text-sm font-medium">{emailPreview.sender_email}</p>
                ) : (
                  <div className="flex items-center gap-2 text-amber-600">
                    <AlertTriangle className="h-4 w-4" />
                    <p className="text-sm">Ingen avsändaradress konfigurerad. Gå till Inställningar → Företagsprofil.</p>
                  </div>
                )}
              </div>

              {/* Recipient */}
              <div className="rounded-lg border p-3 space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Mottagare (individuellt utskick)</p>
                <div className="flex items-center gap-2 py-1">
                  <div className="h-6 w-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-500">
                    {pendingPayslipEmp.first_name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{pendingPayslipEmp.first_name} {pendingPayslipEmp.last_name}</p>
                    {pendingPayslipEmp.wage_period ? (
                      <p className="text-xs text-muted-foreground">
                        {(() => {
                          const emp = overview?.employees.find(e => e.employee_id === pendingPayslipEmp.employee_id);
                          const recipient = emailPreview.recipients.find(r => r.employee_id === pendingPayslipEmp.employee_id);
                          return recipient?.email || "Ingen e-post angiven";
                        })()}
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>

              {/* Warning if no email */}
              {!emailPreview.recipients.find(r => r.employee_id === pendingPayslipEmp.employee_id)?.has_email && (
                <div className="flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 p-3">
                  <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5" />
                  <p className="text-xs text-amber-700">
                    Denna anställd har ingen e-postadress. PDF:en skapas men kan inte e-postas.
                  </p>
                </div>
              )}

              <p className="text-xs text-muted-foreground text-center">
                E-postmeddelandet skickas individuellt — aldrig som gruppmail.
              </p>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setEmailPreviewOpen(false)}>
              Avbryt
            </Button>
            <Button
              onClick={() => pendingPayslipEmp && sendPayslip(pendingPayslipEmp)}
              disabled={!emailPreview?.sender_configured}
            >
              <Send className="h-4 w-4 mr-2" />
              Skicka
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
