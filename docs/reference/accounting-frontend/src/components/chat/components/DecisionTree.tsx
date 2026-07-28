import { useCallback, useMemo, useState } from "react";
import { CheckCircle2, XCircle, HelpCircle, ChevronRight, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TreeNode {
  id: string;
  question?: string;
  answer?: string;
  type?: "question" | "yes" | "no" | "conclusion" | "warning";
  children?: Array<{ label: string; node: TreeNode }>;
}

export interface DecisionTreeProps {
  title?: string;
  description?: string;
  root: TreeNode;
}

const TYPE_STYLES = {
  question: "bg-muted border-border text-foreground",
  yes: "bg-green-50 border-green-200 text-green-800 dark:bg-green-950/20 dark:border-green-800 dark:text-green-300",
  no: "bg-red-50 border-red-200 text-red-800 dark:bg-red-950/20 dark:border-red-800 dark:text-red-300",
  conclusion: "bg-green-50 border-green-300 text-green-900 dark:bg-green-950/30 dark:border-green-700 dark:text-green-200",
  warning: "bg-yellow-50 border-yellow-300 text-yellow-900 dark:bg-yellow-950/30 dark:border-yellow-700 dark:text-yellow-200",
};

function NodeIcon({ type }: { type?: TreeNode["type"] }) {
  if (type === "conclusion") return <CheckCircle2 className="size-3.5 shrink-0 text-green-600 dark:text-green-400" />;
  if (type === "no") return <XCircle className="size-3.5 shrink-0 text-red-500" />;
  if (type === "warning") return <HelpCircle className="size-3.5 shrink-0 text-yellow-600 dark:text-yellow-400" />;
  return null;
}

function TreeNodeView({
  node,
  depth = 0,
  expandedNodes,
  onToggle,
}: {
  node: TreeNode;
  depth?: number;
  expandedNodes: Set<string>;
  onToggle: (id: string) => void;
}) {
  const style = TYPE_STYLES[node.type ?? "question"];
  const text = node.question ?? node.answer ?? "";
  const hasChildren = !!node.children && node.children.length > 0;
  const isExpanded = expandedNodes.has(node.id);

  return (
    <div className={cn("flex flex-col gap-2", depth > 0 && "ml-4 pl-3 border-l border-border")}>
      <button
        type="button"
        onClick={() => hasChildren && onToggle(node.id)}
        className={cn(
          "flex items-start gap-1.5 rounded-lg border px-3 py-2 text-xs leading-snug text-left w-full transition-colors",
          style,
          hasChildren && "cursor-pointer hover:brightness-95 dark:hover:brightness-110",
        )}
      >
        <NodeIcon type={node.type} />
        <span className="flex-1 text-pretty">{text}</span>
        {hasChildren &&
          (isExpanded ? (
            <ChevronDown className="size-3.5 shrink-0 mt-0.5 text-muted-foreground" />
          ) : (
            <ChevronRight className="size-3.5 shrink-0 mt-0.5 text-muted-foreground" />
          ))}
      </button>

      {hasChildren && isExpanded && (
        <div className="flex flex-col gap-3 animate-[step-in_150ms_ease-out_both]">
          {node.children!.map((child, i) => (
            <div key={i} className="flex flex-col gap-1">
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-medium ml-1">
                <ChevronRight className="size-3" />
                {child.label}
              </div>
              <TreeNodeView
                node={child.node}
                depth={depth + 1}
                expandedNodes={expandedNodes}
                onToggle={onToggle}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function collectAllIds(node: TreeNode): string[] {
  const ids = [node.id];
  for (const child of node.children ?? []) {
    ids.push(...collectAllIds(child.node));
  }
  return ids;
}

export function DecisionTree({ title, description, root }: DecisionTreeProps) {
  const initialIds = useMemo(() => (root ? collectAllIds(root) : []), [root]);
  const [expandedIds, setExpandedIds] = useState<string[]>(initialIds);
  const expandedSet = useMemo(() => new Set(expandedIds), [expandedIds]);

  const handleToggle = useCallback((id: string) => {
    setExpandedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }, []);

  return (
    <div className="my-3 border-y border-border/40 py-3">
      <div className="flex items-start justify-between mb-1">
        {title && <p className="text-sm font-medium text-foreground">{title}</p>}
        <button
          type="button"
          onClick={() =>
            setExpandedIds(expandedIds.length > 0 ? [] : collectAllIds(root))
          }
          className="text-[10px] text-muted-foreground hover:text-foreground transition-colors shrink-0"
        >
          {expandedIds.length > 0 ? "Collapse all" : "Expand all"}
        </button>
      </div>
      {description && <p className="mb-3 text-xs text-muted-foreground text-pretty">{description}</p>}
      <TreeNodeView node={root} expandedNodes={expandedSet} onToggle={handleToggle} />
    </div>
  );
}
