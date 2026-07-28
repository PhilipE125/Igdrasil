import { useEffect, useState } from "react";
import { FileText, ChevronLeft, ChevronRight, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { listWagePeriods, downloadPayslip, type WagePeriod } from "@/lib/employeeApi";

const MONTH_NAMES = [
  "", "Januari", "Februari", "Mars", "April", "Maj", "Juni",
  "Juli", "Augusti", "September", "Oktober", "November", "December",
];

interface PayslipViewerProps {
  employeeId: string;
}

export function PayslipViewer({ employeeId }: PayslipViewerProps) {
  const [periods, setPeriods] = useState<WagePeriod[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    listWagePeriods(employeeId)
      .then((wps) => {
        const withPayslip = wps.filter((wp) => wp.payslip_s3_key);
        setPeriods(withPayslip);
        setCurrentIdx(0);
      })
      .catch(() => setPeriods([]))
      .finally(() => setLoading(false));
  }, [employeeId]);

  if (loading) {
    return <div className="flex items-center justify-center h-40 text-sm text-muted-foreground">Laddar...</div>;
  }

  if (periods.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
        <FileText className="h-8 w-8 mb-2" />
        <p className="text-sm">Inga lönespecifikationer ännu</p>
      </div>
    );
  }

  const current = periods[currentIdx];
  const label = `${MONTH_NAMES[current.period_month]} ${current.period_year}`;

  async function handleDownload() {
    try {
      const { download_url } = await downloadPayslip(employeeId, current.id);
      window.open(download_url, "_blank");
    } catch {
      // silently fail
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon"
          disabled={currentIdx >= periods.length - 1}
          onClick={() => setCurrentIdx((i) => i + 1)}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm font-medium">{label}</span>
        <Button
          variant="ghost"
          size="icon"
          disabled={currentIdx <= 0}
          onClick={() => setCurrentIdx((i) => i - 1)}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Summary card */}
      <div className="rounded-lg border p-4 space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Bruttolön</span>
          <span>{current.gross_pay?.toLocaleString("sv-SE")} kr</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Skatteavdrag</span>
          <span>−{current.tax_deduction?.toLocaleString("sv-SE")} kr</span>
        </div>
        {current.own_expenses > 0 && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Egna utlägg</span>
            <span>{current.own_expenses.toLocaleString("sv-SE")} kr</span>
          </div>
        )}
        <div className="flex justify-between font-semibold border-t pt-2">
          <span>Nettolön</span>
          <span>{current.net_pay?.toLocaleString("sv-SE")} kr</span>
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Status</span>
          <span className={current.status === "confirmed" ? "text-green-600" : "text-yellow-600"}>
            {current.status === "confirmed" ? "Bekräftad" : current.status === "sent" ? "Skickad" : "Utkast"}
          </span>
        </div>
      </div>

      <Button variant="outline" size="sm" className="w-full" onClick={handleDownload}>
        <Download className="h-4 w-4 mr-2" />
        Ladda ner PDF
      </Button>
    </div>
  );
}
