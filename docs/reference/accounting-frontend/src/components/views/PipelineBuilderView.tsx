import "@xyflow/react/dist/style.css";
import { useCallback, useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  Handle,
  Position,
  addEdge,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type Connection,
  type NodeProps,
} from "@xyflow/react";
import {
  Bot,
  ChevronRight,
  FileText,
  History,
  Loader2,
  Mail,
  Maximize2,
  Minimize2,
  Play,
  Plus,
  ScanSearch,
  Trash2,
  Upload,
  X,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Ban,
  Plug,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { QueryLogPanel } from "@/components/QueryLogPanel";
import {
  listPipelineRuns,
  listDocuments,
  getPipelineRun,
  uploadFileToPipeline,
  deleteDocument,
  runAllUploaded,
  type PipelineRun,
  type BackendDocument,
  getGmailStatus,
  triggerGmailSync,
  getGmailEmails,
  getGmailAuthorizationUrl,
  type GmailStatusResponse,
  type GmailEmailItem,
} from "@/lib/uploadApi";
import { useActiveRun } from "@/lib/hooks/useActiveRun";
import { useFileStore } from "@/contexts/FileStoreContext";

// ── Brand ─────────────────────────────────────────────────────────────────────

const BRAND = {
  pink: "#ee8fe0",
  green: "#b0ee8f",
  yellow: "#eedd8f",
  gray1: "#bbbbbb",
  gray2: "#aaaaaa",
} as const;

const EDGE_STYLE = { stroke: BRAND.gray1, strokeWidth: 2 };
const EDGE_ACTIVE = { stroke: BRAND.green, strokeWidth: 2 };

// ── Stage helpers ─────────────────────────────────────────────────────────────

const STAGE_NODES: Record<string, string[]> = {
  classify: ["extract_text", "check_duplicate", "classify_type", "structure_text", "flag_document"],
  match: ["lookup_supplier", "lookup_card_rules", "classify_accounts", "create_journal"],
};

const STAGE_STEP_LABELS: Record<string, string> = {
  extract_text: "Extract text from document",
  check_duplicate: "Check for duplicates",
  classify_type: "Classify document type",
  structure_text: "Structure invoice data",
  flag_document: "Flag document for review",
  lookup_supplier: "Look up supplier history",
  lookup_card_rules: "Check card rules",
  classify_accounts: "Classify accounts (BAS)",
  create_journal: "Create journal entry",
};

function deriveStageStatus(
  stageId: string,
  run: PipelineRun | null,
): "idle" | "running" | "completed" | "failed" {
  if (!run) return "idle";
  const members = STAGE_NODES[stageId];
  if (!members) return "idle";
  const history: string[] = Array.isArray(run.node_history) ? run.node_history : [];
  const visited = history.filter((n) => members.includes(n));
  if (visited.length === 0) return "idle";
  if (visited.includes("flag_document")) return "failed";
  if (run.status === "running" && stageId === "match" && history.every((n) => STAGE_NODES.classify?.includes(n))) return "idle";
  if (run.status === "completed" || visited.some((n) => STAGE_NODES.match?.includes(n))) return "completed";
  if (run.status === "running") return "running";
  return "completed";
}

// ── ReactFlow custom nodes ────────────────────────────────────────────────────

type SourceData = {
  icon: React.ElementType;
  title: string;
  description: string;
  accentColor: string;
  onClick?: () => void;
  active?: boolean;
};

function SourceNode({ data, selected }: NodeProps) {
  const d = data as SourceData;
  const Icon = d.icon;
  return (
    <div
      className={cn(
        "flex w-56 cursor-pointer items-center gap-3 rounded-xl border bg-card px-4 py-3.5 shadow-sm transition-all hover:bg-accent/30",
        "border-l-[3px]",
        d.active ? "border-border ring-2 ring-offset-0" : "border-border",
      )}
      style={{ borderLeftColor: d.accentColor, ...(d.active ? { boxShadow: `0 0 0 2px ${d.accentColor}44` } : {}) }}
      onClick={d.onClick}
    >
      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg" style={{ background: `${d.accentColor}22` }}>
        <Icon className="size-4" style={{ color: d.accentColor }} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">{d.title}</p>
        <p className="truncate text-[11px] text-muted-foreground">{d.description}</p>
      </div>
      <Handle type="source" position={Position.Right} className="!size-2 !opacity-0" />
    </div>
  );
}

type AgentData = {
  icon: React.ElementType;
  title: string;
  description: string;
  badge: string;
  accentColor: string;
  status?: "idle" | "running" | "completed" | "failed";
  onClick?: () => void;
  active?: boolean;
};

function AgentNode({ data, selected }: NodeProps) {
  const d = data as AgentData;
  const Icon = d.icon;
  const status = d.status ?? "idle";
  const accentColor =
    status === "completed" ? BRAND.green :
    status === "running" ? BRAND.yellow :
    status === "failed" ? BRAND.pink :
    d.accentColor;
  const badgeLabel =
    status === "running" ? "running" :
    status === "completed" ? "done" :
    status === "failed" ? "flagged" :
    d.badge;
  const badgeTextColor =
    accentColor === BRAND.green ? "#3a6b3a" :
    accentColor === BRAND.yellow ? "#6b5e00" :
    accentColor === BRAND.pink ? "#8b2a6e" : "#555";

  return (
    <div
      className={cn(
        "w-60 cursor-pointer rounded-xl border border-border bg-card shadow-sm transition-all hover:bg-accent/30",
        status === "running" && "animate-pulse",
      )}
      style={d.active ? { boxShadow: `0 0 0 2px ${accentColor}44` } : {}}
      onClick={d.onClick}
    >
      <Handle type="target" position={Position.Left} className="!size-2 !opacity-0" />
      <div className="flex items-center gap-3 px-4 pt-3.5 pb-3">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg" style={{ background: `${accentColor}22` }}>
          {status === "running" ? <Loader2 className="size-4 animate-spin" style={{ color: accentColor }} /> : <Icon className="size-4" style={{ color: accentColor }} />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-medium text-foreground">{d.title}</p>
            <span className="shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide" style={{ background: `${accentColor}33`, color: badgeTextColor }}>{badgeLabel}</span>
          </div>
          <p className="truncate text-[11px] text-muted-foreground">{d.description}</p>
        </div>
      </div>
      <Handle type="source" position={Position.Right} className="!size-2 !opacity-0" />
    </div>
  );
}

const nodeTypes = { source: SourceNode, agent: AgentNode };

// ── Graph builder ─────────────────────────────────────────────────────────────

function buildNodes(
  onNodeClick: (id: string) => void,
  run: PipelineRun | null,
  selectedNodeId: string | null,
): Node[] {
  return [
    { id: "upload", type: "source", position: { x: 40, y: 60 }, data: { icon: Upload, title: "Mass Upload", description: "Invoices & receipts", accentColor: BRAND.pink, onClick: () => onNodeClick("upload"), active: selectedNodeId === "upload" } },
    { id: "email", type: "source", position: { x: 40, y: 200 }, data: { icon: Mail, title: "Email Inbox", description: "Auto-fetched on arrival", accentColor: BRAND.yellow, onClick: () => onNodeClick("email"), active: selectedNodeId === "email" } },
    { id: "classify", type: "agent", position: { x: 340, y: 118 }, data: { icon: Bot, title: "Classify Document", description: "Swedish accounting rules", badge: "AI", accentColor: BRAND.pink, status: deriveStageStatus("classify", run), onClick: () => onNodeClick("classify"), active: selectedNodeId === "classify" } },
    { id: "match", type: "agent", position: { x: 650, y: 118 }, data: { icon: ScanSearch, title: "Match & Book", description: "Supplier lookup & account mapping", badge: "AI", accentColor: BRAND.green, status: deriveStageStatus("match", run), onClick: () => onNodeClick("match"), active: selectedNodeId === "match" } },
  ];
}

function buildEdges(run: PipelineRun | null): Edge[] {
  const classifyDone = ["completed", "failed"].includes(deriveStageStatus("classify", run));
  return [
    { id: "e-upload-classify", source: "upload", target: "classify", type: "smoothstep", style: EDGE_STYLE },
    { id: "e-email-classify", source: "email", target: "classify", type: "smoothstep", style: EDGE_STYLE },
    { id: "e-classify-match", source: "classify", target: "match", type: "smoothstep", style: classifyDone ? EDGE_ACTIVE : EDGE_STYLE },
  ];
}

// ── Upload overlay ────────────────────────────────────────────────────────────

function UploadOverlay({ onClose, onUploaded }: { onClose: () => void; onUploaded: () => void }) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ done: 0, total: 0 });
  const [finished, setFinished] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(files: FileList | File[]) {
    const fileList = Array.from(files).filter((f) =>
      ["application/pdf", "image/jpeg", "image/png"].includes(f.type),
    );
    if (fileList.length === 0) {
      setError("No supported files selected (PDF, JPEG, PNG)");
      return;
    }
    setError(null);
    setUploading(true);
    setUploadProgress({ done: 0, total: fileList.length });

    let failures = 0;
    for (const file of fileList) {
      try {
        await uploadFileToPipeline(file);
      } catch {
        failures++;
      }
      setUploadProgress((prev) => ({ ...prev, done: prev.done + 1 }));
    }

    if (failures > 0 && failures === fileList.length) {
      setError("All uploads failed");
      setUploading(false);
    } else {
      if (failures > 0) setError(`${failures} of ${fileList.length} uploads failed`);
      setFinished(true);
      setTimeout(() => { onUploaded(); onClose(); }, 1200);
    }
  }

  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-background/80 backdrop-blur-sm">
      <div className="w-96 rounded-2xl border border-border bg-card shadow-lg">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <p className="text-sm font-medium">Upload Documents</p>
          <button onClick={onClose} className="rounded p-1 hover:bg-accent"><X className="size-4 text-muted-foreground" /></button>
        </div>
        <div className="p-5">
          {finished ? (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <div className="rounded-full p-3" style={{ background: `${BRAND.green}33` }}><Upload className="size-6" style={{ color: BRAND.green }} /></div>
              <p className="text-sm font-medium">{uploadProgress.total} file{uploadProgress.total !== 1 ? "s" : ""} uploaded</p>
              <p className="text-xs text-muted-foreground">Click Run to start processing</p>
            </div>
          ) : uploading ? (
            <div className="flex flex-col items-center gap-3 py-8">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Uploading {uploadProgress.done} / {uploadProgress.total}…</p>
            </div>
          ) : (
            <>
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => { e.preventDefault(); setIsDragging(false); if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files); }}
                onClick={() => inputRef.current?.click()}
                className={cn("flex cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-dashed py-12 transition-colors", isDragging ? "border-[#b0ee8f] bg-[#b0ee8f11]" : "border-border hover:border-[#bbbbbb] hover:bg-accent/40")}
              >
                <Upload className="size-8 text-muted-foreground" />
                <div className="text-center"><p className="text-sm font-medium">Drop files here</p><p className="text-xs text-muted-foreground">or click to browse</p></div>
                <p className="text-[10px]" style={{ color: BRAND.gray2 }}>PDF · JPEG · PNG — multiple files supported</p>
              </div>
              <input ref={inputRef} type="file" accept=".pdf,image/jpeg,image/png" multiple className="hidden" onChange={(e) => { if (e.target.files?.length) handleFiles(e.target.files); }} />
            </>
          )}
          {error && <p className="mt-3 rounded-md border px-3 py-2 text-xs" style={{ borderColor: BRAND.pink, color: BRAND.pink, background: `${BRAND.pink}11` }}>{error}</p>}
        </div>
      </div>
    </div>
  );
}

// ── Node detail panels ────────────────────────────────────────────────────────

function docStatusIcon(status: string) {
  if (status === "completed" || status === "processed") return <CheckCircle2 className="size-3.5" style={{ color: BRAND.green }} />;
  if (status === "duplicate") return <Ban className="size-3.5" style={{ color: BRAND.pink }} />;
  if (status === "failed") return <AlertTriangle className="size-3.5" style={{ color: BRAND.pink }} />;
  if (["extracting", "classifying", "structuring"].includes(status)) return <Loader2 className="size-3.5 animate-spin" style={{ color: BRAND.yellow }} />;
  return <Clock className="size-3.5 text-muted-foreground" />;
}

function docStatusLabel(doc: BackendDocument): { label: string; isDuplicate: boolean } {
  if (doc.status === "duplicate") return { label: "Duplicate", isDuplicate: true };
  if (doc.status === "failed" && doc.error_message?.toLowerCase().includes("duplicate")) return { label: "Duplicate", isDuplicate: true };
  if (doc.status === "failed") return { label: doc.error_message?.slice(0, 40) || "Failed", isDuplicate: false };
  if (doc.status === "completed" || doc.status === "processed") return { label: "Completed", isDuplicate: false };
  return { label: doc.status.replace(/_/g, " "), isDuplicate: false };
}

function UploadNodePanel({ onUpload }: { onUpload: () => void }) {
  const queryClient = useQueryClient();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data: documents = [], isLoading } = useQuery({
    queryKey: ["pipeline-documents"],
    queryFn: () => listDocuments({ pageSize: 50 }),
    refetchInterval: 10_000,
  });

  const sorted = [...documents].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  const duplicateCount = sorted.filter((d) => d.status === "duplicate" || (d.status === "failed" && d.error_message?.toLowerCase().includes("duplicate"))).length;
  const completedCount = sorted.filter((d) => d.status === "approved" || d.status === "exported").length;
  const processingCount = sorted.filter((d) => !["approved", "exported", "failed", "duplicate"].includes(d.status)).length;

  async function handleDelete(docId: string) {
    setDeletingId(docId);
    try {
      await deleteDocument(docId);
      queryClient.invalidateQueries({ queryKey: ["pipeline-documents"] });
    } catch {
      // best-effort
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div>
      {/* Upload action bar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-border">
        <div className="flex items-center gap-4">
          <p className="text-sm font-medium">Mass Upload</p>
          <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1"><div className="size-1.5 rounded-full" style={{ background: BRAND.green }} />{completedCount} completed</span>
            {processingCount > 0 && <span className="flex items-center gap-1"><div className="size-1.5 rounded-full" style={{ background: BRAND.yellow }} />{processingCount} processing</span>}
            {duplicateCount > 0 && <span className="flex items-center gap-1"><Ban className="size-3" style={{ color: BRAND.pink }} />{duplicateCount} duplicates</span>}
          </div>
        </div>
        <button
          onClick={onUpload}
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-foreground transition-opacity hover:opacity-80"
          style={{ backgroundColor: BRAND.green }}
        >
          <Upload className="size-3" />
          Upload Document
        </button>
      </div>
      {/* Document table */}
      <div className="max-h-48 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center gap-2 px-5 py-4 text-xs text-muted-foreground"><Loader2 className="size-3.5 animate-spin" /> Loading…</div>
        ) : sorted.length === 0 ? (
          <div className="px-5 py-6 text-center text-xs text-muted-foreground">No documents uploaded yet. Click "Upload Document" to get started.</div>
        ) : (
          <table className="w-full text-xs">
            <thead><tr className="border-b text-left text-muted-foreground"><th className="py-2 pl-5 pr-2 font-medium">File</th><th className="py-2 px-2 font-medium">Type</th><th className="py-2 px-2 font-medium">Status</th><th className="py-2 px-2 font-medium text-right">Uploaded</th><th className="py-2 px-2 pr-5 font-medium w-8" /></tr></thead>
            <tbody>
              {sorted.map((doc) => {
                const { label, isDuplicate } = docStatusLabel(doc);
                const isDeleting = deletingId === doc.id;
                return (
                  <tr key={doc.id} className={cn("group border-b last:border-0 hover:bg-accent/30", isDuplicate && "opacity-50")}>
                    <td className="py-2 pl-5 pr-2"><div className="flex items-center gap-2"><FileText className="size-3.5 shrink-0 text-muted-foreground" /><span className={cn("truncate max-w-[200px]", isDuplicate && "line-through")}>{doc.original_filename}</span></div></td>
                    <td className="py-2 px-2 uppercase text-muted-foreground">{doc.file_type}</td>
                    <td className="py-2 px-2"><span className="flex items-center gap-1.5">{docStatusIcon(doc.status)}<span className={isDuplicate ? "text-[#8b2a6e]" : ""}>{label}</span></span></td>
                    <td className="py-2 px-2 text-right text-muted-foreground tabular-nums">{new Date(doc.created_at).toLocaleDateString()}</td>
                    <td className="py-2 px-2 pr-5">
                      <button
                        onClick={() => handleDelete(doc.id)}
                        disabled={isDeleting}
                        className="rounded p-1 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive hover:bg-destructive/10 transition-all disabled:opacity-40"
                        title="Remove document"
                      >
                        {isDeleting ? <Loader2 className="size-3 animate-spin" /> : <Trash2 className="size-3" />}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function EmailNodePanel() {
  const [status, setStatus] = useState<GmailStatusResponse | null>(null);
  const [emails, setEmails] = useState<GmailEmailItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const s = await getGmailStatus();
        if (!cancelled) {
          setStatus(s);
          if (s.connected) {
            const e = await getGmailEmails({ status: "processed", limit: 5 });
            if (!cancelled) setEmails(e);
          }
        }
      } catch {
        /* not connected */
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const handleSync = async () => {
    setSyncing(true);
    try {
      await triggerGmailSync();
      const s = await getGmailStatus();
      setStatus(s);
      const e = await getGmailEmails({ status: "processed", limit: 5 });
      setEmails(e);
    } catch { /* ignore */ }
    finally { setSyncing(false); }
  };

  const handleConnect = async () => {
    try {
      const url = await getGmailAuthorizationUrl({ returnTo: "/settings" });
      window.location.assign(url);
    } catch { /* ignore */ }
  };

  if (loading) {
    return (
      <div className="px-5 py-6 text-center">
        <Loader2 className="mx-auto mb-2 size-5 animate-spin text-muted-foreground/40" />
        <p className="text-xs text-muted-foreground">Loading email status...</p>
      </div>
    );
  }

  if (!status?.connected) {
    return (
      <div className="px-5 py-6 text-center">
        <Mail className="mx-auto mb-2 size-8 text-muted-foreground/30" />
        <p className="text-sm text-muted-foreground mb-2">Email inbox integration</p>
        <p className="text-[11px] text-muted-foreground mb-3">Connect your Gmail to auto-fetch invoices and receipts</p>
        <button
          onClick={handleConnect}
          className="inline-flex items-center gap-1.5 rounded border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors"
        >
          <Plug className="h-3 w-3" />
          Connect Gmail
        </button>
      </div>
    );
  }

  return (
    <div className="px-5 py-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Mail className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Email Inbox</span>
          <span className="ml-1 inline-block h-1.5 w-1.5 rounded-full bg-green-500" />
        </div>
        <button
          onClick={handleSync}
          disabled={syncing}
          className="inline-flex items-center gap-1 rounded px-2 py-1 text-[11px] text-muted-foreground hover:bg-muted transition-colors disabled:opacity-50"
        >
          {syncing ? <Loader2 className="h-3 w-3 animate-spin" /> : <Play className="h-3 w-3" />}
          Sync
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        <div>
          <div className="text-lg font-semibold">{status.total_emails_processed ?? 0}</div>
          <div className="text-[10px] text-muted-foreground">Emails</div>
        </div>
        <div>
          <div className="text-lg font-semibold">{status.total_attachments_extracted ?? 0}</div>
          <div className="text-[10px] text-muted-foreground">Attachments</div>
        </div>
        <div>
          <div className="text-[11px] text-muted-foreground mt-1">
            {status.last_synced_at
              ? new Date(status.last_synced_at).toLocaleDateString()
              : "—"}
          </div>
          <div className="text-[10px] text-muted-foreground">Last sync</div>
        </div>
      </div>

      {emails.length > 0 && (
        <div className="space-y-1">
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Recent</p>
          {emails.map((e) => (
            <div key={e.id} className="flex items-center gap-2 rounded px-2 py-1 text-[11px] hover:bg-muted/50">
              <FileText className="h-3 w-3 shrink-0 text-muted-foreground/50" />
              <span className="truncate flex-1">{e.subject || e.sender_email}</span>
              <span className="shrink-0 text-muted-foreground">{e.attachment_count}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StageProgressPanel({
  stageId,
  title,
  run,
}: {
  stageId: string;
  title: string;
  run: PipelineRun | null;
}) {
  const members = STAGE_NODES[stageId] ?? [];
  const history: string[] = run && Array.isArray(run.node_history) ? run.node_history : [];
  const queries: Array<{ node: string; type: string; duration_ms?: number }> =
    run && Array.isArray(run.queries_log) ? run.queries_log : [];
  const stageStatus = deriveStageStatus(stageId, run);

  return (
    <div>
      <div className="flex items-center justify-between px-5 py-3 border-b border-border">
        <p className="text-sm font-medium">{title}</p>
        <span
          className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase"
          style={{
            background:
              stageStatus === "completed" ? `${BRAND.green}33` :
              stageStatus === "running" ? `${BRAND.yellow}33` :
              stageStatus === "failed" ? `${BRAND.pink}33` :
              `${BRAND.gray1}33`,
            color:
              stageStatus === "completed" ? "#3a6b3a" :
              stageStatus === "running" ? "#6b5e00" :
              stageStatus === "failed" ? "#8b2a6e" :
              BRAND.gray2,
          }}
        >
          {stageStatus}
        </span>
      </div>
      <div className="px-5 py-3 space-y-1.5">
        {!run ? (
          <p className="text-xs text-muted-foreground py-3 text-center">Upload a document and run the pipeline to see progress here.</p>
        ) : (
          members.map((nodeId) => {
            const visited = history.includes(nodeId);
            const isCurrent = run.status === "running" && history[history.length - 1] === nodeId;
            const isFlagged = nodeId === "flag_document" && visited;
            const query = queries.find((q) => q.node === nodeId);
            const durationMs = query?.duration_ms;

            const dotColor = isFlagged ? BRAND.pink : visited ? BRAND.green : isCurrent ? BRAND.yellow : BRAND.gray1;

            return (
              <div key={nodeId} className={cn("flex items-center gap-3 rounded-md px-2 py-1.5 text-xs", visited || isCurrent ? "text-foreground" : "text-muted-foreground")}>
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {isCurrent && !visited ? (
                    <Loader2 className="size-3 shrink-0 animate-spin" style={{ color: BRAND.yellow }} />
                  ) : (
                    <div className="size-2 shrink-0 rounded-full" style={{ background: dotColor }} />
                  )}
                  <span className="truncate">{STAGE_STEP_LABELS[nodeId] ?? nodeId}</span>
                </div>
                {durationMs != null && (
                  <span className="shrink-0 tabular-nums text-muted-foreground">{durationMs}ms</span>
                )}
                {visited && !isFlagged && <CheckCircle2 className="size-3 shrink-0" style={{ color: BRAND.green }} />}
                {isFlagged && <AlertTriangle className="size-3 shrink-0" style={{ color: BRAND.pink }} />}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function NodeDetailPanel({
  nodeId,
  run,
  onClose,
  onUpload,
}: {
  nodeId: string;
  run: PipelineRun | null;
  onClose: () => void;
  onUpload: () => void;
}) {
  return (
    <div className="border-t border-border bg-background">
      <div className="flex justify-end px-3 pt-1">
        <button onClick={onClose} className="rounded p-1 hover:bg-accent"><X className="size-3.5 text-muted-foreground" /></button>
      </div>
      {nodeId === "upload" && <UploadNodePanel onUpload={onUpload} />}
      {nodeId === "email" && <EmailNodePanel />}
      {nodeId === "classify" && <StageProgressPanel stageId="classify" title="Classify Document" run={run} />}
      {nodeId === "match" && <StageProgressPanel stageId="match" title="Match & Book" run={run} />}
    </div>
  );
}

// ── Run History Panel ─────────────────────────────────────────────────────────

function statusDotColor(status: string) {
  if (status === "completed") return BRAND.green;
  if (status === "failed") return BRAND.pink;
  if (status === "running") return BRAND.yellow;
  return BRAND.gray1;
}

function RunHistoryPanel({ onClose, onRunSelect }: { onClose: () => void; onRunSelect: (run: PipelineRun | null) => void }) {
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);
  const { data: runs = [], isLoading } = useQuery({ queryKey: ["pipeline-runs"], queryFn: () => listPipelineRuns(30), refetchInterval: 15_000 });
  const { data: selectedRun } = useQuery({ queryKey: ["pipeline-run", selectedRunId], queryFn: () => getPipelineRun(selectedRunId!), enabled: !!selectedRunId });

  useEffect(() => { onRunSelect(selectedRun ?? null); }, [selectedRun, onRunSelect]);

  return (
    <div className="flex w-72 shrink-0 flex-col border-l bg-background overflow-hidden">
      <div className="flex h-12 items-center justify-between border-b px-4">
        <span className="text-sm font-medium">Run History</span>
        <button onClick={() => { onClose(); onRunSelect(null); }} className="rounded p-1 hover:bg-accent"><X className="h-4 w-4 text-muted-foreground" /></button>
      </div>
      {selectedRunId && selectedRun ? (
        <div className="flex flex-col flex-1 overflow-hidden">
          <button className="flex items-center gap-1.5 px-4 py-2 text-xs text-muted-foreground hover:bg-accent border-b" onClick={() => { setSelectedRunId(null); onRunSelect(null); }}>
            <ChevronRight className="h-3 w-3 rotate-180" /> Back to list
          </button>
          <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
            <p><span className="text-muted-foreground">Status: </span><span className="font-semibold capitalize">{selectedRun.status}</span></p>
            <p><span className="text-muted-foreground">Started: </span>{new Date(selectedRun.started_at).toLocaleString()}</p>
            {selectedRun.completed_at && <p><span className="text-muted-foreground">Completed: </span>{new Date(selectedRun.completed_at).toLocaleString()}</p>}
            <p><span className="text-muted-foreground">Tokens: </span>{(selectedRun.total_input_tokens + selectedRun.total_output_tokens).toLocaleString()}</p>
            {selectedRun.error_message && <div className="rounded-md border p-2" style={{ borderColor: BRAND.pink, color: BRAND.pink, background: `${BRAND.pink}11` }}>{selectedRun.error_message}</div>}
            {Array.isArray(selectedRun.queries_log) && selectedRun.queries_log.length > 0 && <QueryLogPanel queries={selectedRun.queries_log as Parameters<typeof QueryLogPanel>[0]["queries"]} />}
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center gap-2 p-4 text-xs text-muted-foreground"><Loader2 className="h-3 w-3 animate-spin" /> Loading…</div>
          ) : runs.length === 0 ? (
            <p className="p-4 text-xs text-muted-foreground">No pipeline runs yet.</p>
          ) : (
            (runs as PipelineRun[]).map((run) => (
              <button key={run.id} className="flex w-full flex-col gap-1 px-4 py-3 text-left hover:bg-accent border-b last:border-0" onClick={() => setSelectedRunId(run.id)}>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5"><div className="size-2 rounded-full" style={{ backgroundColor: statusDotColor(run.status) }} /><span className="text-[11px] font-medium capitalize text-foreground">{run.status}</span></div>
                  <span className="text-[10px] tabular-nums" style={{ color: BRAND.gray2 }}>{(run.total_input_tokens + run.total_output_tokens).toLocaleString()} tok</span>
                </div>
                <p className="text-[11px] text-muted-foreground">{new Date(run.started_at).toLocaleString()}</p>
                {run.error_message && <p className="text-[10px] line-clamp-1" style={{ color: BRAND.pink }}>{run.error_message}</p>}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ── Pipeline Card ─────────────────────────────────────────────────────────────

interface PipelineConfig { id: string; name: string; enabledStages: string[]; }

function PipelineCard({ pipeline, onDelete, canDelete }: { pipeline: PipelineConfig; onDelete: () => void; canDelete: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [activeProcessId, setActiveProcessId] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const queryClient = useQueryClient();
  const { refreshFiles } = useFileStore();

  const { run: activeRun } = useActiveRun(activeProcessId);

  const { data: documents = [] } = useQuery({
    queryKey: ["pipeline-documents"],
    queryFn: () => listDocuments({ pageSize: 50 }),
    refetchInterval: 10_000,
  });

  const uploadedCount = documents.filter((d) => d.status === "uploaded").length;

  async function handleRunPipeline() {
    if (uploadedCount === 0) return;
    setRunning(true);
    try {
      const { processIds } = await runAllUploaded(pipeline.enabledStages);
      if (processIds.length > 0) setActiveProcessId(processIds[0]);
      queryClient.invalidateQueries({ queryKey: ["pipeline-documents"] });
      void refreshFiles();
    } catch {
      // best-effort
    } finally {
      setRunning(false);
    }
  }

  function handleNodeClick(id: string) {
    setSelectedNodeId((prev) => (prev === id ? null : id));
  }

  const [nodes, setNodes, onNodesChange] = useNodesState(
    buildNodes(handleNodeClick, null, null),
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState(buildEdges(null));

  useEffect(() => {
    setNodes((prev) => {
      const updated = buildNodes(handleNodeClick, activeRun ?? null, selectedNodeId);
      return updated.map((n) => {
        const existing = prev.find((p) => p.id === n.id);
        return existing ? { ...n, position: existing.position } : n;
      });
    });
    setEdges(buildEdges(activeRun ?? null));
  }, [activeRun, selectedNodeId]);

  const onConnect = useCallback(
    (params: Connection) =>
      setEdges((eds) => addEdge({ ...params, type: "smoothstep", style: EDGE_STYLE }, eds)),
    [setEdges],
  );

  const canvasHeight = expanded ? 520 : 320;

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-5 py-3">
        <div>
          <p className="text-sm font-medium text-foreground">{pipeline.name} Pipeline</p>
          <p className="text-[11px] text-muted-foreground">Click any node to see its details</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRunPipeline}
            disabled={uploadedCount === 0 || running}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-foreground transition-opacity hover:opacity-80 disabled:opacity-40"
            style={{ backgroundColor: BRAND.green }}
            title={uploadedCount === 0 ? "No documents waiting to be processed" : `Run pipeline on ${uploadedCount} uploaded document${uploadedCount !== 1 ? "s" : ""}`}
          >
            {running ? <Loader2 className="size-3 animate-spin" /> : <Play className="size-3" />}
            Run{uploadedCount > 0 ? ` (${uploadedCount})` : ""}
          </button>
          <button onClick={() => setExpanded((v) => !v)} className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground" title={expanded ? "Collapse" : "Expand"}>
            {expanded ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
          </button>
          {canDelete && (
            <button onClick={onDelete} className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground" title="Remove pipeline">
              <Trash2 className="size-4" />
            </button>
          )}
        </div>
      </div>

      {/* Canvas */}
      <div className="relative" style={{ height: canvasHeight, transition: "height 200ms ease" }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          minZoom={0.4}
          maxZoom={2}
          nodesDraggable
          nodesConnectable={false}
          defaultEdgeOptions={{ type: "smoothstep", style: EDGE_STYLE }}
          proOptions={{ hideAttribution: true }}
        >
          <Background variant={BackgroundVariant.Dots} gap={24} size={1} color={BRAND.gray1} />
          {expanded && <Controls className="[&>button]:!border-border [&>button]:!bg-background [&>button]:!text-foreground [&>button:hover]:!bg-accent" showInteractive={false} />}
        </ReactFlow>

        {uploadOpen && (
          <UploadOverlay
            onClose={() => setUploadOpen(false)}
            onUploaded={() => { queryClient.invalidateQueries({ queryKey: ["pipeline-documents"] }); void refreshFiles(); setUploadOpen(false); }}
          />
        )}
      </div>

      {/* Node detail panel */}
      {selectedNodeId && (
        <NodeDetailPanel
          nodeId={selectedNodeId}
          run={activeRun ?? null}
          onClose={() => setSelectedNodeId(null)}
          onUpload={() => setUploadOpen(true)}
        />
      )}
    </div>
  );
}

// ── Main view ─────────────────────────────────────────────────────────────────

let nextId = 1;

export function PipelineBuilderView() {
  const [pipelines, setPipelines] = useState<PipelineConfig[]>([
    { id: "default", name: "Receipt & Invoice", enabledStages: ["classify", "match"] },
  ]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [selectedRun, setSelectedRun] = useState<PipelineRun | null>(null);

  function addPipeline() {
    nextId += 1;
    setPipelines((prev) => [...prev, { id: `pipeline-${nextId}`, name: `Pipeline ${nextId}`, enabledStages: ["classify", "match"] }]);
  }

  function removePipeline(id: string) {
    setPipelines((prev) => prev.filter((p) => p.id !== id));
  }

  return (
    <div className="flex flex-1 overflow-hidden">
      <div className="flex flex-1 flex-col overflow-y-auto">
        <div className="flex h-12 shrink-0 items-center gap-3 border-b border-border bg-background px-6">
          <p className="text-sm font-medium text-foreground">Pipeline Builder</p>
          <button onClick={addPipeline} className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground">
            <Plus className="size-3.5" /> New pipeline
          </button>
          <div className="flex-1" />
          <button onClick={() => setHistoryOpen((v) => !v)} className={cn("flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm transition-colors", historyOpen ? "bg-accent text-foreground" : "text-muted-foreground hover:bg-accent")}>
            <History className="size-3.5" /> Runs
          </button>
        </div>

        <div className="flex flex-col gap-6 p-6">
          {pipelines.map((p) => (
            <PipelineCard key={p.id} pipeline={p} onDelete={() => removePipeline(p.id)} canDelete={pipelines.length > 1} />
          ))}
        </div>
      </div>

      {historyOpen && <RunHistoryPanel onClose={() => setHistoryOpen(false)} onRunSelect={setSelectedRun} />}
    </div>
  );
}
