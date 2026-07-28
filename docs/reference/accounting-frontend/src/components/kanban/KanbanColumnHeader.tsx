import { memo } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface KanbanColumnHeaderProps {
  title: string;
  count: number;
  accent: string;
  accentText: string;
  expanded: boolean;
  onToggleExpand: () => void;
}

export const KanbanColumnHeader = memo(function KanbanColumnHeader({
  title,
  count,
  accent,
  accentText,
  expanded,
  onToggleExpand,
}: KanbanColumnHeaderProps) {
  return (
    <div className="flex items-center justify-between px-3 py-2.5">
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-medium text-foreground">{title}</h3>
        <span
          className="flex size-5 items-center justify-center rounded-full text-[10px] font-semibold"
          style={{ backgroundColor: `${accent}40`, color: accentText }}
        >
          {count}
        </span>
      </div>
      <button
        onClick={onToggleExpand}
        className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
      >
        {expanded ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
      </button>
    </div>
  );
});
