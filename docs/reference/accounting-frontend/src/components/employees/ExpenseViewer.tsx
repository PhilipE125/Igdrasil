import { useEffect, useState } from "react";
import { Receipt, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { listEmployeeExpenses, type Expense } from "@/lib/employeeApi";

interface ExpenseViewerProps {
  employeeId: string;
}

export function ExpenseViewer({ employeeId }: ExpenseViewerProps) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    listEmployeeExpenses(employeeId, search || undefined)
      .then((data) => { if (!cancelled) setExpenses(data); })
      .catch(() => { if (!cancelled) setExpenses([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [employeeId, search]);

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Sök utlägg..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="text-center text-sm text-muted-foreground py-8">Laddar...</div>
      ) : expenses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
          <Receipt className="h-8 w-8 mb-2" />
          <p className="text-sm">Inga utlägg hittade</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2 max-h-[400px] overflow-y-auto">
          {expenses.map((exp) => (
            <div
              key={exp.id}
              className="rounded-lg border p-3 text-xs space-y-1 hover:bg-accent/50 transition-colors"
            >
              <p className="font-medium truncate">{exp.description || exp.original_filename}</p>
              {exp.amount != null && (
                <p className="text-muted-foreground">{exp.amount.toLocaleString("sv-SE")} kr</p>
              )}
              <p className="text-muted-foreground">
                {new Date(exp.created_at).toLocaleDateString("sv-SE")}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
