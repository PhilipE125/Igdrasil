import { useState, useCallback, useEffect, useRef } from "react";
import { Upload, X, AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";
import { FileIcon } from "@/components/ui/FileIcon";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { hashFileBytes } from "@/lib/accounting-engine";
import { getKnownHashes, uploadFileToPipeline } from "@/lib/uploadApi";
import { toast } from "@/hooks/use-toast";

const ACCEPTED_TYPES = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];
const ACCEPTED_EXTENSIONS = [".pdf", ".jpg", ".jpeg", ".png"];

function isAccepted(f: File): boolean {
  return ACCEPTED_TYPES.includes(f.type) || ACCEPTED_EXTENSIONS.some((ext) => f.name.toLowerCase().endsWith(ext));
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface StagedFile {
  file: File;
  hash: string | null;       // null while hashing
  isDuplicate: boolean;
  uploadDone: boolean;
  uploading: boolean;
}

interface MassUploadViewProps {
  open: boolean;
  onClose: () => void;
  onUploaded: () => void;
}

export function MassUploadView({ open, onClose, onUploaded }: MassUploadViewProps) {
  const [staged, setStaged] = useState<StagedFile[]>([]);
  const [knownHashes, setKnownHashes] = useState<Set<string>>(new Set());
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch known hashes when dialog opens
  useEffect(() => {
    if (!open) return;
    getKnownHashes()
      .then((hashes) => setKnownHashes(new Set(hashes)))
      .catch(() => {
        // Non-fatal: duplicate detection will be skipped but upload still works
      });
  }, [open]);

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setStaged([]);
      setDragOver(false);
      setUploading(false);
    }
  }, [open]);

  const processFiles = useCallback(
    async (files: File[]) => {
      const incoming = files.filter(isAccepted);
      if (incoming.length === 0) return;

      // Add files to staged list immediately (hash=null while computing)
      const newEntries: StagedFile[] = incoming.map((file) => ({
        file,
        hash: null,
        isDuplicate: false,
        uploadDone: false,
        uploading: false,
      }));

      setStaged((prev) => {
        // Deduplicate by filename within staged list
        const existingNames = new Set(prev.map((s) => s.file.name));
        return [...prev, ...newEntries.filter((e) => !existingNames.has(e.file.name))];
      });

      // Hash each file via Rust WASM
      for (const entry of newEntries) {
        try {
          const buffer = await entry.file.arrayBuffer();
          const hash = await hashFileBytes(new Uint8Array(buffer));
          const isDuplicate = knownHashes.has(hash);
          setStaged((prev) =>
            prev.map((s) =>
              s.file === entry.file ? { ...s, hash, isDuplicate } : s
            )
          );
        } catch {
          // If hashing fails, mark as non-duplicate so upload can proceed
          setStaged((prev) =>
            prev.map((s) =>
              s.file === entry.file ? { ...s, hash: "error", isDuplicate: false } : s
            )
          );
        }
      }
    },
    [knownHashes]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const files = Array.from(e.dataTransfer.files);
      void processFiles(files);
    },
    [processFiles]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        void processFiles(Array.from(e.target.files));
        // Reset input so the same file can be re-added after removal
        e.target.value = "";
      }
    },
    [processFiles]
  );

  const removeFile = useCallback((file: File) => {
    setStaged((prev) => prev.filter((s) => s.file !== file));
  }, []);

  const handleUpload = useCallback(async () => {
    const toUpload = staged.filter((s) => !s.isDuplicate && !s.uploadDone);
    if (toUpload.length === 0) return;

    setUploading(true);

    let successCount = 0;
    for (const entry of toUpload) {
      setStaged((prev) =>
        prev.map((s) => (s.file === entry.file ? { ...s, uploading: true } : s))
      );
      try {
        await uploadFileToPipeline(entry.file, entry.hash ?? undefined);
        successCount++;
        setStaged((prev) =>
          prev.map((s) =>
            s.file === entry.file ? { ...s, uploading: false, uploadDone: true } : s
          )
        );
      } catch (err) {
        setStaged((prev) =>
          prev.map((s) => (s.file === entry.file ? { ...s, uploading: false } : s))
        );
        toast({
          title: "Upload failed",
          description: `Could not upload ${entry.file.name}. Please try again.`,
          variant: "destructive",
        });
      }
    }

    setUploading(false);

    if (successCount > 0) {
      onUploaded();
      toast({
        title: `${successCount} file${successCount > 1 ? "s" : ""} uploaded`,
        description: "Documents are queued for processing.",
      });
      onClose();
    }
  }, [staged, onUploaded, onClose]);

  const readyCount = staged.filter((s) => !s.isDuplicate && !s.uploadDone).length;
  const duplicateCount = staged.filter((s) => s.isDuplicate).length;
  const uploadedCount = staged.filter((s) => s.uploadDone).length;
  const hashingCount = staged.filter((s) => s.hash === null).length;
  const uploadProgress = staged.length > 0 ? (uploadedCount / staged.filter((s) => !s.isDuplicate).length) * 100 : 0;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen && !uploading) onClose(); }}>
      <DialogContent className="max-w-2xl w-full max-h-[90vh] flex flex-col gap-0 p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
          <DialogTitle className="text-base font-semibold">Mass Upload</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Drop files below. Duplicates are detected instantly before uploading.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Drop zone */}
          <div className="px-6 py-4">
            <div
              className={cn(
                "border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer",
                dragOver
                  ? "border-primary/60 bg-accent/40"
                  : "border-border hover:border-primary/30 hover:bg-accent/20"
              )}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm font-medium text-foreground">Drop files here or click to browse</p>
              <p className="text-xs text-muted-foreground mt-1">PDF, JPG, PNG supported</p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
                onChange={handleFileInput}
              />
            </div>
          </div>

          {/* Staged files list */}
          {staged.length > 0 && (
            <div className="flex-1 overflow-hidden flex flex-col px-6 pb-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-muted-foreground">
                  {staged.length} file{staged.length !== 1 ? "s" : ""} staged
                  {hashingCount > 0 && ` · hashing ${hashingCount}…`}
                  {duplicateCount > 0 && ` · ${duplicateCount} duplicate${duplicateCount !== 1 ? "s" : ""}`}
                </p>
                {!uploading && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs h-6 px-2 text-muted-foreground"
                    onClick={() => setStaged([])}
                  >
                    Clear all
                  </Button>
                )}
              </div>

              <ScrollArea className="flex-1 rounded-md border border-border">
                <div className="divide-y divide-border">
                  {staged.map((entry, i) => (
                    <div key={`${entry.file.name}-${i}`} className="flex items-center gap-3 px-3 py-2.5">
                      {/* Icon / status */}
                      <div className="shrink-0">
                        {entry.uploadDone ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        ) : entry.uploading ? (
                          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        ) : entry.isDuplicate ? (
                          <AlertTriangle className="h-4 w-4 text-amber-500" />
                        ) : entry.hash === null ? (
                          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        ) : (
                          <FileIcon name={entry.file.name} className="h-4 w-4" />
                        )}
                      </div>

                      {/* File name + size */}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate text-foreground">{entry.file.name}</p>
                        <p className="text-[10px] text-muted-foreground">{formatBytes(entry.file.size)}</p>
                      </div>

                      {/* Badge */}
                      <div className="shrink-0">
                        {entry.uploadDone ? (
                          <Badge variant="outline" className="text-[10px] bg-green-500/15 text-green-700 border-green-300">
                            Uploaded
                          </Badge>
                        ) : entry.isDuplicate ? (
                          <Badge variant="outline" className="text-[10px] bg-amber-500/15 text-amber-700 border-amber-300">
                            Duplicate
                          </Badge>
                        ) : entry.hash === null ? (
                          <Badge variant="outline" className="text-[10px] text-muted-foreground">
                            Hashing…
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/30">
                            Ready
                          </Badge>
                        )}
                      </div>

                      {/* Remove button */}
                      {!entry.uploadDone && !entry.uploading && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-6 shrink-0 opacity-60 hover:opacity-100"
                          onClick={() => removeFile(entry.file)}
                          disabled={uploading}
                          aria-label={`Remove ${entry.file.name}`}
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border flex items-center justify-between gap-3">
          <div className="flex-1">
            {uploading && (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Uploading…</p>
                <Progress value={uploadProgress} className="h-1.5" />
              </div>
            )}
            {!uploading && duplicateCount > 0 && readyCount === 0 && (
              <p className="text-xs text-amber-600">
                All files are duplicates — nothing to upload.
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClose} disabled={uploading}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleUpload}
              disabled={uploading || readyCount === 0 || hashingCount > 0}
            >
              {uploading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                  Uploading…
                </>
              ) : (
                <>
                  <Upload className="h-3.5 w-3.5 mr-1.5" />
                  Upload {readyCount > 0 ? `${readyCount} file${readyCount !== 1 ? "s" : ""}` : ""}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
