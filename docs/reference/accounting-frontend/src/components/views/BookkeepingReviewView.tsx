import { useState, useEffect } from "react";
import { useFileStore } from "@/contexts/FileStoreContext";
import { KanbanBoardView } from "@/components/kanban/KanbanBoardView";
import { ReviewDetailView } from "./ReviewDetailView";

export const BookkeepingReviewView = () => {
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const { focusFileId, setFocusFileId } = useFileStore();

  useEffect(() => {
    if (focusFileId) {
      setSelectedDocumentId(focusFileId);
      setFocusFileId(null);
    }
  }, [focusFileId, setFocusFileId]);

  const handleSelectDocument = (id: string) => {
    setFocusFileId(id);
    setSelectedDocumentId(id);
  };

  if (selectedDocumentId) {
    return (
      <div className="flex flex-1 flex-col overflow-hidden">
        <ReviewDetailView />
      </div>
    );
  }

  return <KanbanBoardView onSelectDocument={handleSelectDocument} />;
};
