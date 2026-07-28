import { memo, useCallback } from "react";
import { Loader2 } from "lucide-react";
import { FileIcon } from "@/components/ui/FileIcon";
import { cn } from "@/lib/utils";
import { formatAmount } from "@/lib/formatters";
import type { ArchivedFile } from "@/lib/fileArchiveTypes";

interface KanbanDocumentCardProps {
  file: ArchivedFile;
  accent: string;
  isProcessing?: boolean;
  clickable?: boolean;
  onSelect?: (id: string) => void;
}

export const KanbanDocumentCard = memo(function KanbanDocumentCard({
  file,
  accent,
  isProcessing,
  clickable,
  onSelect,
}: KanbanDocumentCardProps) {
  const handleClick = useCallback(() => {
    onSelect?.(file.id);
  }, [onSelect, file.id]);

  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-background p-3 transition-colors",
        clickable && "cursor-pointer hover:bg-accent/30",
      )}
      onClick={clickable ? handleClick : undefined}
    >
      <div className="flex items-start gap-2.5">
        <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted/50">
          {isProcessing ? (
            <Loader2 className="size-3.5 animate-spin text-muted-foreground" />
          ) : (
            <FileIcon name={file.name} className="size-3.5" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-medium text-foreground">{file.name}</p>
          {file.supplier && (
            <p className="truncate text-[11px] text-muted-foreground">{file.supplier}</p>
          )}
        </div>
        <div className="size-2 shrink-0 rounded-full mt-1" style={{ backgroundColor: accent }} />
      </div>
      {file.amount != null && (
        <div className="mt-2 flex items-center justify-between text-[11px]">
          <span className="text-muted-foreground">
            {file.invoiceDate ? file.invoiceDate.toLocaleDateString("sv-SE") : ""}
          </span>
          <span className="font-medium tabular-nums text-foreground">
            {formatAmount(file.amount, file.fxCurrency)}
          </span>
        </div>
      )}
    </div>
  );
});
