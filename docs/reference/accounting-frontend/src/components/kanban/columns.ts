export type KanbanColumnId =
  | "upload-email"
  | "classification"
  | "bank-matching"
  | "review"
  | "accounted"
  | "failed";

export interface ColumnDef {
  id: KanbanColumnId;
  title: string;
  statuses: string[];
  accent: string;
  accentText: string;
}

export const KANBAN_COLUMNS: ColumnDef[] = [
  {
    id: "upload-email",
    title: "Upload & Email",
    statuses: ["uploaded"],
    accent: "#eedd8f",
    accentText: "#6b5e00",
  },
  {
    id: "classification",
    title: "Classification",
    statuses: ["extracting", "structuring", "classifying", "classified"],
    accent: "#ee8fe0",
    accentText: "#8b2a6e",
  },
  {
    id: "bank-matching",
    title: "Bank Matching",
    statuses: ["needs_match", "pending_payment_match"],
    accent: "#eedd8f",
    accentText: "#6b5e00",
  },
  {
    id: "review",
    title: "Review",
    statuses: ["pending_review"],
    accent: "#ee8fe0",
    accentText: "#8b2a6e",
  },
  {
    id: "accounted",
    title: "Accounted",
    statuses: ["approved", "exported"],
    accent: "#b0ee8f",
    accentText: "#3a6b3a",
  },
  {
    id: "failed",
    title: "Failed",
    statuses: ["failed", "duplicate"],
    accent: "#ee8f8f",
    accentText: "#6b3a3a",
  },
];

const STATUS_TO_COLUMN: Record<string, KanbanColumnId> = {};
for (const col of KANBAN_COLUMNS) {
  for (const s of col.statuses) {
    STATUS_TO_COLUMN[s] = col.id;
  }
}

export function getColumnForDocument(
  documentStatus: string | undefined,
  bookkeepingStatus?: string,
): KanbanColumnId {
  if (bookkeepingStatus === "processed") return "accounted";
  const status = documentStatus ?? "uploaded";
  return STATUS_TO_COLUMN[status] ?? "upload-email";
}
