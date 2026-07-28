import { useState, useCallback, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, Search, ExternalLink, Trash2, Shield, AlertTriangle, Loader2, X, Grid3X3, List, FolderUp } from "lucide-react";
import { FileIcon } from "@/components/ui/FileIcon";
import { MassUploadView } from "./MassUploadView";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { FileArchiveTree } from "./FileArchiveTree";
import { buildTree } from "@/lib/fileArchiveTypes";
import type { ArchivedFile, LedgerType } from "@/lib/fileArchiveTypes";
import { useFileStore } from "@/contexts/FileStoreContext";
import { Skeleton } from "@/components/ui/skeleton";
import { format, differenceInMonths } from "date-fns";

const directoryInputAttributes = {
  webkitdirectory: "",
  directory: "",
} as const;

function getStatusLabel(file: ArchivedFile): string {
  if (file.documentStatus === "uploaded") {
    if (file.importSource === "gmail") return "Imported from Gmail";
    return "Uploaded";
  }
  return file.bookkeepingStatus;
}

function getStatusClassName(file: ArchivedFile): string {
  const label = getStatusLabel(file);
  if (label === "processed" || label === "Uploaded") return "bg-green-500/20 text-green-700";
  if (label === "flagged") return "bg-destructive/20 text-destructive";
  if (label.startsWith("Imported from")) return "bg-blue-500/20 text-blue-700";
  return "";
}

export function FileArchiveView() {
  const navigate = useNavigate();
  const { files, processing, processQueue, addFiles, deleteFile, setFocusFileId, loadingFiles, refreshFiles } = useFileStore();
  const [selectedFile, setSelectedFile] = useState<ArchivedFile | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [ledgerType, setLedgerType] = useState<LedgerType>("payable");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [dragOver, setDragOver] = useState(false);
  const [deleteCandidate, setDeleteCandidate] = useState<ArchivedFile | null>(null);
  const [massUploadOpen, setMassUploadOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      if (e.dataTransfer.files.length > 0) addFiles(e.dataTransfer.files, ledgerType);
    },
    [addFiles, ledgerType]
  );

  const handleDelete = useCallback((id: string) => {
    const file = files.find((f) => f.id === id);
    if (!file) return;
    setDeleteCandidate(file);
  }, [files]);

  const confirmDelete = useCallback(async () => {
    if (!deleteCandidate) return;
    const deletedId = deleteCandidate.id;
    setDeleteCandidate(null);

    try {
      await deleteFile(deletedId);
      if (selectedFile?.id === deletedId) setSelectedFile(null);
    } catch {
      // Error is already surfaced via toast in the store.
    }
  }, [deleteCandidate, deleteFile, selectedFile?.id]);

  const filtered = useMemo(
    () => files.filter((f) => {
      if (f.ledgerType !== ledgerType) return false;
      const q = searchQuery.toLowerCase();
      const matchesSearch = !q || f.name.toLowerCase().includes(q) || f.supplier.toLowerCase().includes(q) || (f.invoiceNumber?.toLowerCase().includes(q) ?? false);
      const matchesStatus = statusFilter === "all" || f.bookkeepingStatus === statusFilter;
      return matchesSearch && matchesStatus;
    }),
    [files, ledgerType, searchQuery, statusFilter],
  );

  const tree = useMemo(() => buildTree(filtered), [filtered]);

  const retentionWarning = useCallback((file: ArchivedFile) => {
    const monthsLeft = differenceInMonths(file.retentionExpiry, new Date());
    if (monthsLeft <= 6 && monthsLeft > 0) return "expiring";
    if (monthsLeft <= 0) return "expired";
    return null;
  }, []);

  const deleteMessage = useMemo(() => {
    if (!deleteCandidate) return "Delete this archived file?";
    const monthsLeft = differenceInMonths(deleteCandidate.retentionExpiry, new Date());
    return monthsLeft > 0
      ? `This file must be retained for ${Math.ceil(monthsLeft / 12)} more years per bookkeeping law. Delete anyway?`
      : "Delete this archived file?";
  }, [deleteCandidate]);

  return (
    <div className="flex h-[calc(100dvh-3.5rem)] flex-col">
      {/* Top Bar */}
      <div className="flex items-center gap-3 border-b border-border bg-background px-4 py-3">
        {/* AP / AR toggle */}
        <div className="flex items-center border border-border rounded-md">
          <Button
            variant={ledgerType === "payable" ? "secondary" : "ghost"}
            size="sm"
            className="rounded-r-none text-xs h-8 px-3"
            onClick={() => { setLedgerType("payable"); setSelectedFile(null); }}
          >
            Leverantörsfakturor
          </Button>
          <Button
            variant={ledgerType === "receivable" ? "secondary" : "ghost"}
            size="sm"
            className="rounded-l-none text-xs h-8 px-3"
            onClick={() => { setLedgerType("receivable"); setSelectedFile(null); }}
          >
            Kundfakturor
          </Button>
        </div>

        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            name="archiveSearch"
            autoComplete="off"
            placeholder="Search files, suppliers, invoice numbers…"
            aria-label="Search files"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="processed">Processed</SelectItem>
            <SelectItem value="flagged">Flagged</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex items-center border border-border rounded-md">
          <Button variant={viewMode === "list" ? "secondary" : "ghost"} size="icon" className="size-8" onClick={() => setViewMode("list")} aria-label="List view" aria-pressed={viewMode === "list"}>
            <List className="h-4 w-4" />
          </Button>
          <Button variant={viewMode === "grid" ? "secondary" : "ghost"} size="icon" className="size-8" onClick={() => setViewMode("grid")} aria-label="Grid view" aria-pressed={viewMode === "grid"}>
            <Grid3X3 className="h-4 w-4" />
          </Button>
        </div>
        <Button size="sm" onClick={() => setMassUploadOpen(true)}>
          <FolderUp className="h-4 w-4 mr-1" /> Mass Upload
        </Button>
        <Button size="sm" variant="outline" onClick={() => fileInputRef.current?.click()}>
          <Upload className="h-4 w-4 mr-1" /> Quick Upload
        </Button>
        <input ref={fileInputRef} type="file" multiple accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={(e) => e.target.files && addFiles(e.target.files, ledgerType)} />
        <input
          ref={folderInputRef}
          type="file"
          multiple
          accept=".pdf,.jpg,.jpeg,.png"
          className="hidden"
          {...directoryInputAttributes}
          onChange={(e) => e.target.files && addFiles(e.target.files, ledgerType)}
        />
      </div>

      <ResizablePanelGroup direction="horizontal" className="flex-1">
        {/* Left Panel - Tree */}
        <ResizablePanel defaultSize={20} minSize={12} maxSize={35} className="bg-card/50">
          <div className="p-3 border-b border-border">
            <h3 className="text-sm font-medium text-foreground text-balance">
              {ledgerType === "payable" ? "Leverantörsfakturor" : "Kundfakturor"}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">{filtered.length} files · 7yr retention</p>
          </div>
          <ScrollArea className="h-[calc(100%-52px)]">
            <div className="p-2">
              <FileArchiveTree nodes={tree} onSelectFile={setSelectedFile} selectedFileId={selectedFile?.id} />
            </div>
          </ScrollArea>
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Right Panel - Content */}
        <ResizablePanel defaultSize={80} minSize={40} className="overflow-hidden">
          {filtered.length === 0 && !processing && loadingFiles ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : filtered.length === 0 && !processing ? (
            <div
              className={cn(
                "flex flex-col items-center justify-center h-full p-8 transition-colors",
                dragOver && "bg-accent/50"
              )}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
            >
              <div className="flex flex-col items-center max-w-md text-center">
                <div className="rounded-full bg-muted p-6 mb-4">
                  <Upload className="h-10 w-10 text-muted-foreground" />
                </div>
                <h2 className="text-lg font-medium text-foreground mb-1">
                  {ledgerType === "payable" ? "Drop supplier invoices here" : "Drop customer invoices here"}
                </h2>
                <p className="text-sm text-muted-foreground mb-4 text-pretty">
                  Drag and drop PDF/JPG/PNG files or folders to send them into the processing pipeline.
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Shield className="h-3.5 w-3.5" />
                  <span>Files retained for 7 years per bookkeeping compliance</span>
                </div>
              </div>
            </div>
          ) : (
            <div
              className="h-full overflow-auto p-4"
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
            >
              {dragOver && (
                <div className="mb-4 rounded-lg border-2 border-dashed border-primary/40 bg-accent/30 p-6 text-center">
                  <Upload className="h-6 w-6 mx-auto mb-1 text-primary" />
                  <p className="text-sm text-primary">Drop files to add to archive</p>
                </div>
              )}

              {selectedFile && (
                <Card className="mb-4">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <FileIcon name={selectedFile.name} className="h-5 w-5" />
                          <h3 className="font-medium text-foreground">{selectedFile.name}</h3>
                          <Badge
                            variant="outline"
                            className={cn("text-[10px]", getStatusClassName(selectedFile))}
                          >
                            {getStatusLabel(selectedFile)}
                          </Badge>
                          {retentionWarning(selectedFile) === "expiring" && (
                            <Badge variant="outline" className="bg-yellow-500/20 text-yellow-700 text-[10px]">
                              <AlertTriangle className="h-3 w-3 mr-0.5" /> Expiring soon
                            </Badge>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-xs text-muted-foreground mt-2">
                          <span>Supplier: <span className="text-foreground">{selectedFile.supplier}</span></span>
                          <span>Invoice: <span className="text-foreground">{selectedFile.invoiceNumber}</span></span>
                          <span>Date: <span className="text-foreground tabular-nums">{format(selectedFile.invoiceDate, "MMM d, yyyy")}</span></span>
                          <span>Amount: <span className="text-foreground tabular-nums">{selectedFile.amount?.toLocaleString()} {selectedFile.currency}</span></span>
                          <span>Category: <span className="text-foreground">{selectedFile.category}</span></span>
                          <span>Retention until: <span className="text-foreground">{format(selectedFile.retentionExpiry, "MMM yyyy")}</span></span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button size="sm" variant="outline" onClick={() => { setFocusFileId(selectedFile.id); navigate("/bookkeeping"); }}>
                          <ExternalLink className="h-3.5 w-3.5 mr-1" /> Open in Bookkeeping
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setSelectedFile(null)} aria-label="Close file details">
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {viewMode === "list" ? (
                <div
                  className="rounded-lg border border-border overflow-hidden"
                  style={{ contentVisibility: "auto", containIntrinsicSize: "800px" }}
                >
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-muted/50 text-left text-xs text-muted-foreground">
                        <th className="px-3 py-2 font-medium">File</th>
                        <th className="px-3 py-2 font-medium">Supplier</th>
                        <th className="px-3 py-2 font-medium">Date</th>
                        <th className="px-3 py-2 font-medium">Amount</th>
                        <th className="px-3 py-2 font-medium">Status</th>
                        <th className="px-3 py-2 font-medium w-10"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((f) => (
                        <tr
                          key={f.id}
                          className={cn(
                            "group border-t border-border cursor-pointer transition-colors hover:bg-accent/50",
                            selectedFile?.id === f.id && "bg-accent"
                          )}
                          onClick={() => setSelectedFile(f)}
                        >
                          <td className="px-3 py-2 flex items-center gap-2">
                            <FileIcon name={f.name} className="h-4 w-4 shrink-0" />
                            <span className="truncate">{f.name}</span>
                          </td>
                          <td className="px-3 py-2 text-muted-foreground">{f.supplier}</td>
                          <td className="px-3 py-2 text-muted-foreground tabular-nums">{format(f.invoiceDate, "MMM yyyy")}</td>
                          <td className="px-3 py-2 text-muted-foreground tabular-nums">{f.amount?.toLocaleString()} {f.currency}</td>
                          <td className="px-3 py-2">
                            <Badge
                              variant="outline"
                              className={cn("text-[10px]", getStatusClassName(f))}
                            >
                              {getStatusLabel(f)}
                            </Badge>
                          </td>
                          <td className="px-3 py-2">
                            <Button size="icon" variant="ghost" className="size-7 opacity-0 group-hover:opacity-100" onClick={(e) => { e.stopPropagation(); handleDelete(f.id); }} aria-label={`Delete ${f.name}`}>
                              <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div
                  className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3"
                  style={{ contentVisibility: "auto", containIntrinsicSize: "800px" }}
                >
                  {filtered.map((f) => (
                    <Card
                      key={f.id}
                      className={cn(
                        "cursor-pointer transition-colors hover:bg-accent/50",
                        selectedFile?.id === f.id && "ring-2 ring-primary"
                      )}
                      onClick={() => setSelectedFile(f)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <FileIcon name={f.name} className="h-8 w-8 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs font-medium truncate">{f.name}</p>
                            <p className="text-[10px] text-muted-foreground">{f.supplier}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                          <span className="tabular-nums">{format(f.invoiceDate, "MMM yyyy")}</span>
                          <Badge
                            variant="outline"
                            className={cn("text-[10px] px-1", getStatusClassName(f))}
                          >
                            {getStatusLabel(f)}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </ResizablePanel>
      </ResizablePanelGroup>

      <MassUploadView
        open={massUploadOpen}
        onClose={() => setMassUploadOpen(false)}
        onUploaded={() => void refreshFiles()}
      />

      <AlertDialog open={Boolean(deleteCandidate)} onOpenChange={(open) => !open && setDeleteCandidate(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete archived file?</AlertDialogTitle>
            <AlertDialogDescription>{deleteMessage}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
