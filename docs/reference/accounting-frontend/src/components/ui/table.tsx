import * as React from "react";
import { ChevronDown, Plus, Search } from "lucide-react";

import { cn } from "@/lib/utils";

const Table = React.forwardRef<HTMLTableElement, React.HTMLAttributes<HTMLTableElement>>(
  ({ className, ...props }, ref) => (
    <div className="relative w-full overflow-auto">
      <table ref={ref} className={cn("w-full caption-bottom text-[13px] leading-5", className)} {...props} />
    </div>
  ),
);
Table.displayName = "Table";

const TableHeader = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <thead
      ref={ref}
      className={cn("[&_tr]:border-b [&_tr]:border-border/70 [&_tr]:bg-muted/50", className)}
      {...props}
    />
  ),
);
TableHeader.displayName = "TableHeader";

const TableBody = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <tbody ref={ref} className={cn("[&_tr:last-child]:border-0", className)} {...props} />
  ),
);
TableBody.displayName = "TableBody";

const TableFooter = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <tfoot
      ref={ref}
      className={cn("border-t border-border/70 bg-card font-medium [&>tr]:last:border-b-0", className)}
      {...props}
    />
  ),
);
TableFooter.displayName = "TableFooter";

const TableRow = React.forwardRef<HTMLTableRowElement, React.HTMLAttributes<HTMLTableRowElement>>(
  ({ className, ...props }, ref) => (
    <tr
      ref={ref}
      className={cn(
        "border-b border-border/70 transition-colors data-[state=selected]:bg-accent/40 hover:bg-accent/20",
        className,
      )}
      {...props}
    />
  ),
);
TableRow.displayName = "TableRow";

const TableHead = React.forwardRef<HTMLTableCellElement, React.ThHTMLAttributes<HTMLTableCellElement>>(
  ({ className, ...props }, ref) => (
    <th
      ref={ref}
      className={cn(
        "h-8 px-3 py-1.5 text-left align-middle text-[11px] font-medium tracking-[0.01em] text-muted-foreground [&:has([role=checkbox])]:pr-0",
        className,
      )}
      {...props}
    />
  ),
);
TableHead.displayName = "TableHead";

const TableCell = React.forwardRef<HTMLTableCellElement, React.TdHTMLAttributes<HTMLTableCellElement>>(
  ({ className, ...props }, ref) => (
    <td
      ref={ref}
      className={cn("px-3 py-1.5 align-middle [&:has([role=checkbox])]:pr-0", className)}
      {...props}
    />
  ),
);
TableCell.displayName = "TableCell";

const TableToolbar = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex min-h-11 flex-wrap items-center justify-between gap-2 border-b border-border/70 bg-card px-3 py-2",
        className,
      )}
      {...props}
    />
  ),
);
TableToolbar.displayName = "TableToolbar";

const TableToolbarTabs = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex items-center gap-1.5 overflow-x-auto", className)}
      {...props}
    />
  ),
);
TableToolbarTabs.displayName = "TableToolbarTabs";

const TableToolbarSearch = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { inputClassName?: string }
>(({ className, inputClassName, children, ...props }, ref) => (
  <div ref={ref} className={cn("relative w-full min-w-[220px] max-w-sm", className)} {...props}>
    <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
    <div
      className={cn(
        "[&_input]:h-8 [&_input]:rounded-md [&_input]:border-0 [&_input]:bg-transparent [&_input]:pl-8 [&_input]:pr-3 [&_input]:text-sm [&_input]:shadow-none",
        inputClassName,
      )}
    >
      {children}
    </div>
  </div>
));
TableToolbarSearch.displayName = "TableToolbarSearch";

const TableFilterPill = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    active?: boolean;
    chevron?: boolean;
    add?: boolean;
  }
>(({ className, active, chevron = false, add = false, children, type = "button", ...props }, ref) => (
  <button
    ref={ref}
    type={type}
    className={cn(
      "inline-flex h-7 items-center gap-1 rounded-md border border-transparent bg-transparent px-2.5 text-xs font-medium text-foreground/80 transition-colors hover:bg-accent/15 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      active && "border-border/70 bg-background text-foreground shadow-[0_1px_1px_rgba(15,23,42,0.04)]",
      className,
    )}
    {...props}
  >
    <span>{children}</span>
    {add ? <Plus className="h-3.5 w-3.5" /> : null}
    {chevron ? <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" /> : null}
  </button>
));
TableFilterPill.displayName = "TableFilterPill";

const TableCaption = React.forwardRef<HTMLTableCaptionElement, React.HTMLAttributes<HTMLTableCaptionElement>>(
  ({ className, ...props }, ref) => (
    <caption ref={ref} className={cn("mt-4 text-sm text-muted-foreground", className)} {...props} />
  ),
);
TableCaption.displayName = "TableCaption";

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableToolbar,
  TableToolbarTabs,
  TableToolbarSearch,
  TableFilterPill,
  TableCaption,
};
