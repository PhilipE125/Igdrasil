import { useState } from "react";
import { ChevronRight, ChevronDown, Folder, FolderOpen, FileText, Calendar, Building2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { TreeNode, ArchivedFile } from "@/lib/fileArchiveTypes";

interface FileArchiveTreeProps {
  nodes: TreeNode[];
  onSelectFile: (file: ArchivedFile) => void;
  selectedFileId?: string;
}

function TreeNodeItem({
  node,
  depth,
  onSelectFile,
  selectedFileId,
}: {
  node: TreeNode;
  depth: number;
  onSelectFile: (file: ArchivedFile) => void;
  selectedFileId?: string;
}) {
  const [open, setOpen] = useState(depth === 0);
  const hasChildren = node.children && node.children.length > 0;
  const isFile = node.type === "file";

  const icon = () => {
    if (isFile) return <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />;
    if (node.type === "year") return open ? <FolderOpen className="h-4 w-4 shrink-0 text-primary" /> : <Folder className="h-4 w-4 shrink-0 text-primary" />;
    if (node.type === "month") return <Calendar className="h-4 w-4 shrink-0 text-muted-foreground" />;
    return <Building2 className="h-4 w-4 shrink-0 text-muted-foreground" />;
  };

  const statusColor = (file?: ArchivedFile) => {
    if (!file) return "";
    if (file.bookkeepingStatus === "processed") return "bg-green-500/20 text-green-700";
    if (file.bookkeepingStatus === "flagged") return "bg-destructive/20 text-destructive";
    return "bg-muted text-muted-foreground";
  };

  return (
    <div>
      <button
        onClick={() => {
          if (isFile && node.file) onSelectFile(node.file);
          else setOpen(!open);
        }}
        className={cn(
          "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-accent",
          isFile && node.file?.id === selectedFileId && "bg-accent font-medium"
        )}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
      >
        {!isFile && (
          open ? <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" /> : <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        )}
        {isFile && <span className="w-3.5" />}
        {icon()}
        <span className="truncate text-left">{node.label}</span>
        {!isFile && (
          <span className="ml-auto shrink-0 text-xs text-muted-foreground">
            {node.fileCount}
          </span>
        )}
        {isFile && node.file && (
          <Badge className={cn("ml-auto text-[10px] px-1.5 py-0", statusColor(node.file))} variant="outline">
            {node.file.bookkeepingStatus}
          </Badge>
        )}
      </button>
      {open && hasChildren && (
        <div>
          {node.children!.map((child, i) => (
            <TreeNodeItem
              key={`${child.label}-${i}`}
              node={child}
              depth={depth + 1}
              onSelectFile={onSelectFile}
              selectedFileId={selectedFileId}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function FileArchiveTree({ nodes, onSelectFile, selectedFileId }: FileArchiveTreeProps) {
  if (nodes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground text-sm">
        <Folder className="h-8 w-8 mb-2 opacity-40" />
        <p>No files archived yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-0.5">
      {nodes.map((node, i) => (
        <TreeNodeItem key={`${node.label}-${i}`} node={node} depth={0} onSelectFile={onSelectFile} selectedFileId={selectedFileId} />
      ))}
    </div>
  );
}
