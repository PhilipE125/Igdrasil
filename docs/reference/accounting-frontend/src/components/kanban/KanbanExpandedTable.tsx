import { memo, useCallback } from "react";
import { cn } from "@/lib/utils";
import { formatAmount } from "@/lib/formatters";
import type { ArchivedFile } from "@/lib/fileArchiveTypes";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface KanbanExpandedTableProps {
  files: ArchivedFile[];
  clickable?: boolean;
  onClickFile?: (id: string) => void;
}

export const KanbanExpandedTable = memo(function KanbanExpandedTable({
  files,
  clickable,
  onClickFile,
}: KanbanExpandedTableProps) {
  if (files.length === 0) {
    return (
      <p className="px-3 py-4 text-center text-xs text-muted-foreground">
        No documents
      </p>
    );
  }

  return (
    <div className="max-h-80 overflow-y-auto">
      <Table>
        <TableHeader>
          <TableRow className="text-[11px]">
            <TableHead className="py-1.5 pl-3">File</TableHead>
            <TableHead className="py-1.5">Supplier</TableHead>
            <TableHead className="py-1.5 text-right">Amount</TableHead>
            <TableHead className="py-1.5 text-right pr-3">Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {files.map((file) => (
            <TableRow
              key={file.id}
              className={cn(
                "text-xs",
                clickable && "cursor-pointer hover:bg-accent/30",
              )}
              onClick={clickable ? () => onClickFile?.(file.id) : undefined}
            >
              <TableCell className="py-2 pl-3 max-w-[140px] truncate">
                {file.name}
              </TableCell>
              <TableCell className="py-2 max-w-[120px] truncate text-muted-foreground">
                {file.supplier || "-"}
              </TableCell>
              <TableCell className="py-2 text-right tabular-nums">
                {formatAmount(file.amount)}
              </TableCell>
              <TableCell className="py-2 text-right pr-3 text-muted-foreground tabular-nums">
                {file.invoiceDate?.toLocaleDateString("sv-SE") ?? "-"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
});
