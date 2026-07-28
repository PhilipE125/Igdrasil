import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { LayoutGrid, List, Plus, Search, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TableFilterBar } from "@/components/ui/table-filter-bar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { authenticatedApiRequest } from "@/lib/uploadApi";
import {
  listEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  type Employee,
  type EmployeeCreate,
} from "@/lib/employeeApi";
import { EmployeeCard } from "@/components/employees/EmployeeCard";
import { EmployeeForm } from "@/components/employees/EmployeeForm";
import { EmployeeDetailView } from "@/components/employees/EmployeeDetailView";
import { SalaryManagementView } from "@/components/employees/SalaryManagementView";
import { toast } from "@/hooks/use-toast";

interface CardRule {
  id: string;
  card_last_four: string;
  card_brand: string | null;
  person_name: string | null;
}

type View = "list" | "detail" | "salary";
type ListMode = "grid" | "table";

export function EmployeesView() {
  const { id: routeId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [cardRules, setCardRules] = useState<CardRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<View>(routeId ? "detail" : "list");
  const [listMode, setListMode] = useState<ListMode>("grid");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(routeId || null);
  const [formOpen, setFormOpen] = useState(false);

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const [emps, rules] = await Promise.all([
        listEmployees(),
        authenticatedApiRequest<CardRule[]>("/card-rules"),
      ]);
      setEmployees(emps);
      setCardRules(rules);
    } catch {
      toast({ title: "Fel", description: "Kunde inte ladda anställda", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  // Sync with route param
  useEffect(() => {
    if (routeId) {
      setSelectedId(routeId);
      setView("detail");
    }
  }, [routeId]);

  const selectedEmployee = employees.find((e) => e.id === selectedId) || null;
  const filteredEmployees = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return employees;
    return employees.filter((employee) =>
      [
        employee.first_name,
        employee.last_name,
        employee.email ?? "",
        employee.role ?? "",
        employee.card_last_four ?? "",
      ].some((value) => value.toLowerCase().includes(term)),
    );
  }, [employees, search]);

  async function handleCreate(data: EmployeeCreate) {
    await createEmployee(data);
    toast({ title: "Anställd tillagd" });
    await fetchEmployees();
  }

  async function handleUpdate(data: EmployeeCreate) {
    if (!selectedId) return;
    await updateEmployee(selectedId, data);
    toast({ title: "Anställd uppdaterad" });
    await fetchEmployees();
  }

  function openDetail(id: string) {
    setSelectedId(id);
    setView("detail");
    navigate(`/employees/${id}`, { replace: true });
  }

  function goBackToList() {
    setView("list");
    setSelectedId(null);
    navigate("/employees", { replace: true });
  }

  // ─── Salary management view ───────────────────────────────────────
  if (view === "salary") {
    return <SalaryManagementView onBack={() => setView("list")} />;
  }

  // ─── Detail view ──────────────────────────────────────────────────
  if (view === "detail" && selectedEmployee) {
    return (
      <EmployeeDetailView
        employee={selectedEmployee}
        onBack={goBackToList}
        onUpdate={handleUpdate}
        cardRules={cardRules}
      />
    );
  }

  // ─── List view (grid or table) ────────────────────────────────────
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h1 className="text-lg font-semibold">Anställda</h1>
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex border rounded-md">
            <Button
              variant={listMode === "grid" ? "secondary" : "ghost"}
              size="icon"
              className="h-8 w-8 rounded-r-none"
              onClick={() => setListMode("grid")}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={listMode === "table" ? "secondary" : "ghost"}
              size="icon"
              className="h-8 w-8 rounded-l-none"
              onClick={() => setListMode("table")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>

          <Button variant="outline" onClick={() => setView("salary")}>
            <Wallet className="h-4 w-4 mr-2" />
            Hantera Löner
          </Button>

          <Button onClick={() => setFormOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Lägg till
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="text-center text-muted-foreground py-12">Laddar...</div>
        ) : filteredEmployees.length === 0 ? (
          <div className="text-center text-muted-foreground py-12">
            <p className="mb-2">Inga anställda matchade filtret</p>
            <Button variant="outline" onClick={() => setFormOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Lägg till första anställd
            </Button>
          </div>
        ) : listMode === "grid" ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3 rounded-[calc(var(--radius)-2px)] border border-border/80 bg-card px-3 py-2">
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Sök namn, roll, e-post" className="h-8 pl-8" />
              </div>
              <span className="text-xs text-muted-foreground">{filteredEmployees.length} anställda</span>
            </div>
            <div className="grid grid-cols-3 gap-4">
            {filteredEmployees.map((emp) => (
              <EmployeeCard
                key={emp.id}
                employee={emp}
                onClick={() => openDetail(emp.id)}
              />
            ))}
            </div>
          </div>
        ) : (
          <div className="space-y-0">
            <TableFilterBar
              search={search}
              onSearchChange={setSearch}
              placeholder="Sök namn, roll, e-post…"
            />
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Namn</TableHead>
                  <TableHead>Roll</TableHead>
                  <TableHead>E-post</TableHead>
                  <TableHead>Kort</TableHead>
                  <TableHead>Lönetyp</TableHead>
                  <TableHead>Skattesats</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.map((emp) => (
                  <TableRow
                    key={emp.id}
                    className="cursor-pointer hover:bg-accent/50"
                    onClick={() => openDetail(emp.id)}
                  >
                    <TableCell className="font-medium">
                      {emp.first_name} {emp.last_name}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{emp.role || "–"}</TableCell>
                    <TableCell className="text-muted-foreground">{emp.email || "–"}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {emp.card_last_four ? `****${emp.card_last_four}` : "–"}
                    </TableCell>
                    <TableCell>
                      {emp.salary_type === "hourly"
                        ? `Tim (${emp.hourly_rate} kr)`
                        : emp.salary_type === "monthly"
                          ? `Månad (${emp.gross_salary?.toLocaleString("sv-SE")} kr)`
                          : "–"}
                    </TableCell>
                    <TableCell>{emp.tax_rate}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Create form dialog */}
      <EmployeeForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleCreate}
        cardRules={cardRules}
      />
    </div>
  );
}
