import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidePanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: React.ReactNode;
}

export function SidePanel({ open, onOpenChange, title, children }: SidePanelProps) {
  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm"
          onClick={() => onOpenChange(false)}
        />
      )}
      <div
        className={cn(
          "fixed inset-y-0 right-0 z-50 flex w-80 flex-col bg-background border-l border-border shadow-xl transition-transform duration-300 ease-out",
          open ? "translate-x-0" : "translate-x-full",
        )}
        aria-hidden={!open}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
          <h2 className="text-sm font-semibold text-foreground">{title}</h2>
          <button
            onClick={() => onOpenChange(false)}
            className="size-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="flex flex-1 flex-col overflow-hidden px-4 pb-4">
          {children}
        </div>
      </div>
    </>
  );
}
