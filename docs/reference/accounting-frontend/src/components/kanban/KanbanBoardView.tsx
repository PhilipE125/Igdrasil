import { useState, useCallback, useMemo } from "react";
import { Loader2, Inbox } from "lucide-react";
import { useKanbanDocuments } from "@/lib/hooks/useKanbanDocuments";
import { KANBAN_COLUMNS, type KanbanColumnId } from "./columns";
import { KanbanColumnHeader } from "./KanbanColumnHeader";
import { KanbanDocumentCard } from "./KanbanDocumentCard";
import { KanbanExpandedTable } from "./KanbanExpandedTable";

interface KanbanBoardViewProps {
  onSelectDocument: (id: string) => void;
}

const PROCESSING_STATUSES = new Set(["extracting", "structuring", "classifying"]);
const CARD_LIMIT = 20;

export function KanbanBoardView({ onSelectDocument }: KanbanBoardViewProps) {
  const { columns, counts, total, loading } = useKanbanDocuments();
  const [expandedColumns, setExpandedColumns] = useState<Set<KanbanColumnId>>(new Set());

  const toggleExpand = useCallback((colId: KanbanColumnId) => {
    setExpandedColumns((prev) => {
      const next = new Set(prev);
      if (next.has(colId)) next.delete(colId);
      else next.add(colId);
      return next;
    });
  }, []);

  const toggleHandlers = useMemo(
    () => Object.fromEntries(KANBAN_COLUMNS.map((c) => [c.id, () => toggleExpand(c.id)])) as Record<KanbanColumnId, () => void>,
    [toggleExpand],
  );

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (total === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 text-muted-foreground">
        <Inbox className="size-10 opacity-30" />
        <p className="text-sm">No documents in the pipeline</p>
        <p className="text-xs">Upload documents or run the Pipeline Builder to get started.</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 min-w-0 flex-1 gap-3 overflow-hidden p-4">
      {KANBAN_COLUMNS.map((colDef) => {
        const allFiles = columns[colDef.id];
        const isExpanded = expandedColumns.has(colDef.id);
        const isReviewColumn = colDef.id === "review";
        const isUploadEmailColumn = colDef.id === "upload-email";
        const isClassificationColumn = colDef.id === "classification";
        const isAccountedColumn = colDef.id === "accounted";
        const files = isAccountedColumn && !isExpanded ? allFiles.slice(0, CARD_LIMIT) : allFiles;
        const hasMore = isAccountedColumn && !isExpanded && allFiles.length > CARD_LIMIT;

        return (
          <div
            key={colDef.id}
            className="flex min-w-0 flex-1 flex-col rounded-xl border border-border bg-muted/20"
          >
            <KanbanColumnHeader
              title={colDef.title}
              count={counts[colDef.id]}
              accent={colDef.accent}
              accentText={colDef.accentText}
              expanded={isExpanded}
              onToggleExpand={toggleHandlers[colDef.id]}
            />

            <div className="flex-1 overflow-y-auto">
              {isExpanded ? (
                <KanbanExpandedTable
                  files={files}
                  clickable={isReviewColumn}
                  onClickFile={isReviewColumn ? onSelectDocument : undefined}
                />
              ) : (
                <div className="space-y-2 px-2 pb-3">
                  {isUploadEmailColumn ? (
                    <>
                      <div>
                        <h4 className="mb-1.5 px-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                          Upload
                        </h4>
                        {files.length > 0 ? (
                          files.map((f) => (
                            <div key={f.id} className="mb-2">
                              <KanbanDocumentCard file={f} accent={colDef.accent} />
                            </div>
                          ))
                        ) : (
                          <p className="px-1 py-3 text-center text-[11px] text-muted-foreground/50 italic">
                            No uploaded documents
                          </p>
                        )}
                      </div>
                      <div className="border-t border-border pt-2">
                        <h4 className="mb-1.5 px-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                          Email
                        </h4>
                        <p className="px-1 py-3 text-center text-[11px] text-muted-foreground/50 italic">
                          Coming soon
                        </p>
                      </div>
                    </>
                  ) : files.length > 0 ? (
                    files.map((f) => (
                      <KanbanDocumentCard
                        key={f.id}
                        file={f}
                        accent={colDef.accent}
                        isProcessing={isClassificationColumn && PROCESSING_STATUSES.has(f.documentStatus ?? "")}
                        clickable={isReviewColumn}
                        onSelect={isReviewColumn ? onSelectDocument : undefined}
                      />
                    ))
                  ) : (
                    <p className="py-6 text-center text-[11px] text-muted-foreground/50 italic">
                      No documents
                    </p>
                  )}
                  {hasMore && (
                    <button
                      onClick={toggleHandlers[colDef.id]}
                      className="w-full py-2 text-center text-[11px] text-muted-foreground hover:text-foreground transition-colors"
                    >
                      +{allFiles.length - CARD_LIMIT} more — expand to see all
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
