import { createContext, useContext, useEffect, useState, useCallback, useRef, type ReactNode } from "react";
import { createArchivedFileFromAccountingDocument } from "@/lib/fileArchiveTypes";
import type { ArchivedFile, LedgerType } from "@/lib/fileArchiveTypes";
import { deleteDocument, listDocuments, listReviewAccountingEntries, uploadFileToPipeline } from "@/lib/uploadApi";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";
import { useCompany } from "@/contexts/CompanyContext";

interface FileStoreContextType {
  files: ArchivedFile[];
  processing: boolean;
  processQueue: { name: string; done: boolean }[];
  loadingFiles: boolean;
  addFiles: (fileList: FileList | File[], ledgerType?: LedgerType) => Promise<void>;
  deleteFile: (id: string) => Promise<void>;
  updateFile: (id: string, updates: Partial<ArchivedFile>) => void;
  /** Force a refresh of the file list from the backend. */
  refreshFiles: () => Promise<void>;
  /** Set a file ID to focus in Bookkeeping Review (cross-view navigation) */
  focusFileId: string | null;
  setFocusFileId: (id: string | null) => void;
}

const FileStoreContext = createContext<FileStoreContextType | null>(null);

const ACCEPTED_TYPES = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];
const ACCEPTED_EXTENSIONS = [".pdf", ".jpg", ".jpeg", ".png"];
const LEDGER_BY_PROCESS_ID_STORAGE_KEY = "igdrasil_ledger_by_process_id";

function isAcceptedFile(f: File): boolean {
  return ACCEPTED_TYPES.includes(f.type) || ACCEPTED_EXTENSIONS.some((ext) => f.name.toLowerCase().endsWith(ext));
}

function readLedgerMap(): Record<string, LedgerType> {
  try {
    const raw = localStorage.getItem(LEDGER_BY_PROCESS_ID_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, LedgerType>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeLedgerMap(map: Record<string, LedgerType>) {
  try {
    localStorage.setItem(LEDGER_BY_PROCESS_ID_STORAGE_KEY, JSON.stringify(map));
  } catch {
    // Ignore localStorage errors in private mode or quota constraints.
  }
}

function saveLedgerForProcess(processId: string, ledgerType: LedgerType) {
  const map = readLedgerMap();
  map[processId] = ledgerType;
  writeLedgerMap(map);
}

function removeLedgerForProcess(processId: string) {
  const map = readLedgerMap();
  if (!(processId in map)) return;
  delete map[processId];
  writeLedgerMap(map);
}

const PROCESSING_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes

export function FileStoreProvider({ children }: { children: ReactNode }) {
  const [files, setFiles] = useState<ArchivedFile[]>([]);
  const [processing, setProcessing] = useState(false);
  const [processQueue, setProcessQueue] = useState<{ name: string; done: boolean }[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(true);
  const [focusFileId, setFocusFileId] = useState<string | null>(null);
  const { activeCompany } = useCompany();
  const activeCompanyId = activeCompany?.id ?? null;

  // Prevent flicker: while a delete is in-flight, background polling/refreshes might
  // still fetch the soon-to-be-deleted document and re-add it briefly.
  const pendingDeleteIdsRef = useRef<Set<string>>(new Set());
  // Track when each document first entered the processing state (for timeout detection).
  const processingStartTimesRef = useRef<Map<string, number>>(new Map());
  // Whether we have successfully loaded files at least once for the current company.
  const hasLoadedOnceRef = useRef(false);
  // Deduplication: coalesce concurrent refresh calls into a single in-flight request.
  const inflightRefreshRef = useRef<Promise<void> | null>(null);

  const refreshFilesImpl = useCallback(async () => {
    if (!activeCompanyId) return;
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      // On hard refresh Supabase can briefly report no session before it restores from storage.
      // Do not clear the UI list here; we clear only on explicit SIGNED_OUT.
      if (sessionError || !sessionData.session?.access_token) {
        return;
      }

      const [docs, accountingEntries] = await Promise.all([
        listDocuments({ page: 1, pageSize: 100 }),
        listReviewAccountingEntries({ limit: 200 }),
      ]);

      const accountingEntryByDocumentId = new Map(
        accountingEntries
          .filter((entry) => entry.source_document_id || entry.source_id)
          .map((entry) => [(entry.source_document_id ?? entry.source_id) as string, entry]),
      );
      const ledgerMap = readLedgerMap();

      const archivedFiles = await Promise.all(
        docs.map(async (doc) => {
          const ledgerType = ledgerMap[doc.process_id] ?? "payable";
          return createArchivedFileFromAccountingDocument({
            document: doc,
            accountingEntry: accountingEntryByDocumentId.get(doc.id),
            // View URLs are presigned and relatively expensive; fetch lazily for the selected document.
            url: "",
            ledgerType,
          });
        })
      );

      const visibleFiles = archivedFiles.filter((f) => !pendingDeleteIdsRef.current.has(f.id));

      // Preserve any locally cached view URLs and local file blobs across refreshes.
      // Without this, polling can blank out a previously fetched `url` and cause the preview to reload/flicker.
      setFiles((prev) => {
        const prevById = new Map(prev.map((f) => [f.id, f] as const));
        return visibleFiles.map((next) => {
          const existing = prevById.get(next.id);
          if (!existing) return next;

          const url = existing.url || next.url;
          const file = existing.file && existing.file.size > 0 ? existing.file : next.file;
          return { ...next, url, file };
        });
      });

      if (!hasLoadedOnceRef.current) {
        hasLoadedOnceRef.current = true;
        setLoadingFiles(false);
      }
    } catch (error) {
      console.error("Failed to load documents from backend", error);
      if (!hasLoadedOnceRef.current) {
        hasLoadedOnceRef.current = true;
        setLoadingFiles(false);
      }
    }
  }, [activeCompanyId]);

  const refreshFilesFromBackend = useCallback(async () => {
    if (inflightRefreshRef.current) return inflightRefreshRef.current;
    const promise = refreshFilesImpl();
    inflightRefreshRef.current = promise;
    promise.finally(() => { inflightRefreshRef.current = null; });
    return promise;
  }, [refreshFilesImpl]);

  // Poll backend while there are pending items so the UI updates when LLM results arrive.
  // Also enforces a per-document processing timeout to prevent infinite spinners.
  useEffect(() => {
    const ACTIVE_STATUSES = new Set(["uploaded", "extracting", "structuring", "classifying", "classified", "matching"]);
    const pendingFiles = files.filter(
      (f) => (f.bookkeepingStatus === "pending" && !f.ledgerEntryId) ||
             (f.documentStatus && ACTIVE_STATUSES.has(f.documentStatus)),
    );
    if (pendingFiles.length === 0) {
      processingStartTimesRef.current.clear();
      return;
    }

    const now = Date.now();

    // Register start times for newly pending files.
    for (const f of pendingFiles) {
      if (!processingStartTimesRef.current.has(f.id)) {
        processingStartTimesRef.current.set(f.id, now);
      }
    }

    // Mark any file that has been pending beyond the timeout as failed locally.
    const timedOutIds = pendingFiles
      .filter((f) => now - (processingStartTimesRef.current.get(f.id) ?? now) > PROCESSING_TIMEOUT_MS)
      .map((f) => f.id);

    if (timedOutIds.length > 0) {
      setFiles((prev) =>
        prev.map((f) =>
          timedOutIds.includes(f.id) ? { ...f, bookkeepingStatus: "flagged" } : f
        )
      );
      for (const id of timedOutIds) {
        processingStartTimesRef.current.delete(id);
      }
      toast({
        title: "Processing timed out",
        description: "One or more documents took too long to process. Please try uploading again.",
        variant: "destructive",
      });
      return;
    }

    const handle = window.setInterval(() => {
      void refreshFilesFromBackend();
    }, 5000);

    return () => window.clearInterval(handle);
  }, [files, refreshFilesFromBackend]);

  useEffect(() => {
    refreshFilesFromBackend();
  }, [refreshFilesFromBackend]);

  // Clear and reload when the active company changes.
  useEffect(() => {
    setFiles([]);
    setLoadingFiles(true);
    hasLoadedOnceRef.current = false;
    processingStartTimesRef.current.clear();
    pendingDeleteIdsRef.current.clear();
    void refreshFilesFromBackend();
  }, [activeCompanyId, refreshFilesFromBackend]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "INITIAL_SESSION" || event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        void refreshFilesFromBackend();
      }
      if (event === "SIGNED_OUT") {
        setFiles([]);
      }
    });

    return () => subscription.unsubscribe();
  }, [refreshFilesFromBackend]);

  const addFiles = useCallback(async (fileList: FileList | File[], ledgerType: LedgerType = "payable") => {
    const incoming = Array.from(fileList).filter(isAcceptedFile);
    if (incoming.length === 0) return;

    setProcessing(true);
    setProcessQueue(incoming.map((f) => ({ name: f.name, done: false })));

    // Upload concurrently to reduce total time-to-queue for multi-file uploads.
    // Keep the limit low to avoid saturating the network or hitting backend rate limits.
    const CONCURRENCY = 3;
    let successfulUploads = 0;
    let nextIndex = 0;

    const worker = async () => {
      while (true) {
        const i = nextIndex;
        nextIndex += 1;
        if (i >= incoming.length) return;

        const file = incoming[i];
        try {
          const { processId } = await uploadFileToPipeline(file);
          saveLedgerForProcess(processId, ledgerType);
          successfulUploads += 1;
        } catch (error) {
          console.error("Failed to upload file to pipeline", file.name, error);
          toast({
            title: "Upload failed",
            description: `Could not upload ${file.name}. Please try again.`,
            variant: "destructive",
          });
        } finally {
          setProcessQueue((prev) => prev.map((q, idx) => (idx === i ? { ...q, done: true } : q)));
        }
      }
    };

    const workerCount = Math.min(CONCURRENCY, incoming.length);
    await Promise.all(Array.from({ length: workerCount }, () => worker()));

    if (successfulUploads > 0) {
      await refreshFilesFromBackend();
    }
    setProcessing(false);
    setProcessQueue([]);
  }, [refreshFilesFromBackend]);

  const deleteFile = useCallback(async (id: string) => {
    const toDelete = files.find((f) => f.id === id);
    if (!toDelete) return;

    pendingDeleteIdsRef.current.add(id);

    // Optimistic UI update.
    setFiles((prev) => prev.filter((f) => f.id !== id));
    if (focusFileId === id) setFocusFileId(null);

    try {
      await deleteDocument(id);
      if (toDelete.processId) {
        removeLedgerForProcess(toDelete.processId);
      }
      // Ensure UI reflects backend state immediately (also removes any stale queue items).
      await refreshFilesFromBackend();
      pendingDeleteIdsRef.current.delete(id);
    } catch (error) {
      console.error("Failed to delete document", error);
      pendingDeleteIdsRef.current.delete(id);
      // Revert locally and surface error.
      setFiles((prev) => (prev.some((f) => f.id === id) ? prev : [toDelete, ...prev]));
      toast({
        title: "Delete failed",
        description: error instanceof Error ? error.message : "Could not delete the file. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  }, [files, focusFileId, setFocusFileId]);

  const updateFile = useCallback((id: string, updates: Partial<ArchivedFile>) => {
    setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, ...updates } : f)));
  }, []);

  return (
    <FileStoreContext.Provider value={{ files, processing, processQueue, loadingFiles, addFiles, deleteFile, updateFile, refreshFiles: refreshFilesFromBackend, focusFileId, setFocusFileId }}>
      {children}
    </FileStoreContext.Provider>
  );
}

export function useFileStore() {
  const ctx = useContext(FileStoreContext);
  if (!ctx) throw new Error("useFileStore must be used within FileStoreProvider");
  return ctx;
}
