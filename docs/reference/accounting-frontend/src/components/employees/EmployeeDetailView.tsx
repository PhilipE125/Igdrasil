import { useState } from "react";
import { ArrowLeft, Pencil, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import type { Employee, EmployeeCreate } from "@/lib/employeeApi";
import { EmployeeForm } from "./EmployeeForm";
import { PayslipViewer } from "./PayslipViewer";
import { ExpenseViewer } from "./ExpenseViewer";

interface CardRule {
  id: string;
  card_last_four: string;
  person_name: string | null;
}

interface EmployeeDetailViewProps {
  employee: Employee;
  onBack: () => void;
  onUpdate: (data: EmployeeCreate) => Promise<void>;
  cardRules: CardRule[];
}

function CopyField({ label, value }: { label: string; value: string | null }) {
  const [copied, setCopied] = useState(false);

  if (!value) return null;

  function handleCopy() {
    navigator.clipboard.writeText(value!);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="flex items-center justify-between py-1.5 border-b border-gray-100 last:border-0">
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm">{value}</p>
      </div>
      <button
        onClick={handleCopy}
        className="p-1 rounded hover:bg-accent transition-colors text-muted-foreground"
        title="Kopiera"
      >
        {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
      </button>
    </div>
  );
}

export function EmployeeDetailView({
  employee,
  onBack,
  onUpdate,
  cardRules,
}: EmployeeDetailViewProps) {
  const [editOpen, setEditOpen] = useState(false);

  const salaryLabel =
    employee.salary_type === "hourly"
      ? `Timlön: ${employee.hourly_rate?.toLocaleString("sv-SE")} kr/tim`
      : employee.salary_type === "monthly"
        ? `Månadslön: ${employee.gross_salary?.toLocaleString("sv-SE")} kr`
        : "Ej angiven";

  return (
    <>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold truncate">
              {employee.first_name} {employee.last_name}
            </h2>
            {employee.role && (
              <p className="text-sm text-muted-foreground">{employee.role}</p>
            )}
          </div>
          <Button variant="outline" size="icon" onClick={() => setEditOpen(true)}>
            <Pencil className="h-4 w-4" />
          </Button>
        </div>

        {/* Split panel */}
        <ResizablePanelGroup direction="horizontal" className="flex-1">
          <ResizablePanel defaultSize={45} minSize={30}>
            <div className="p-4 overflow-y-auto h-full space-y-1">
              <CopyField label="Personnummer" value={employee.personnummer} />
              <CopyField label="E-post" value={employee.email} />
              <CopyField label="Bank" value={employee.bank_name} />
              <CopyField label="Clearingnummer" value={employee.clearing_number} />
              <CopyField label="Kontonummer" value={employee.account_number} />
              <CopyField
                label="Kopplat kort"
                value={employee.card_last_four ? `****${employee.card_last_four}` : null}
              />
              <CopyField label="Lönetyp" value={salaryLabel} />
              <CopyField label="Skattesats" value={`${employee.tax_rate}%`} />
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          <ResizablePanel defaultSize={55} minSize={30}>
            <div className="p-4 h-full overflow-y-auto">
              <Tabs defaultValue="payslips">
                <TabsList className="w-full">
                  <TabsTrigger value="payslips" className="flex-1">
                    Lönespecifikation
                  </TabsTrigger>
                  <TabsTrigger value="expenses" className="flex-1">
                    Egna utlägg
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="payslips" className="mt-4">
                  <PayslipViewer employeeId={employee.id} />
                </TabsContent>
                <TabsContent value="expenses" className="mt-4">
                  <ExpenseViewer employeeId={employee.id} />
                </TabsContent>
              </Tabs>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      <EmployeeForm
        open={editOpen}
        onOpenChange={setEditOpen}
        onSubmit={onUpdate}
        employee={employee}
        cardRules={cardRules}
      />
    </>
  );
}
