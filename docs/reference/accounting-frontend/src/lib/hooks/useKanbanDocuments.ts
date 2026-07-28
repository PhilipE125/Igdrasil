import { useMemo } from "react";
import { useFileStore } from "@/contexts/FileStoreContext";
import type { ArchivedFile } from "@/lib/fileArchiveTypes";
import { KANBAN_COLUMNS, getColumnForDocument, type KanbanColumnId } from "@/components/kanban/columns";

export interface KanbanData {
  columns: Record<KanbanColumnId, ArchivedFile[]>;
  counts: Record<KanbanColumnId, number>;
  total: number;
  loading: boolean;
}

export function useKanbanDocuments(): KanbanData {
  const { files, loadingFiles } = useFileStore();

  return useMemo(() => {
    const columns: Record<KanbanColumnId, ArchivedFile[]> = {
      "upload-email": [],
      classification: [],
      "bank-matching": [],
      review: [],
      accounted: [],
    };

    for (const file of files) {
      const colId = getColumnForDocument(file.documentStatus, file.bookkeepingStatus);
      columns[colId].push(file);
    }

    // Sort each column by most recent first
    for (const col of KANBAN_COLUMNS) {
      columns[col.id].sort(
        (a, b) => (b.uploadedAt?.getTime() ?? 0) - (a.uploadedAt?.getTime() ?? 0),
      );
    }

    const counts = {} as Record<KanbanColumnId, number>;
    let total = 0;
    for (const col of KANBAN_COLUMNS) {
      counts[col.id] = columns[col.id].length;
      total += columns[col.id].length;
    }

    return { columns, counts, total, loading: loadingFiles };
  }, [files, loadingFiles]);
}
