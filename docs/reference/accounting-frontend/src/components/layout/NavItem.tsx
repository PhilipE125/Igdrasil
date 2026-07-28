import { useState } from "react";
import { useLocation } from "react-router-dom";
import { CornerDownRight } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export interface SubNavItem {
  title: string;
  url: string;
}

export interface NavItemDef {
  title: string;
  url: string;
  /** Any Lucide icon component, or a custom SVG component with the same props */
  icon: LucideIcon | React.ComponentType<React.SVGProps<SVGSVGElement>>;
  children?: SubNavItem[];
}

interface NavItemProps {
  item: NavItemDef;
  /** Pass true when the sidebar is in icon-only (collapsed) mode */
  collapsed?: boolean;
}

const itemBase =
  "flex h-9 items-center gap-2.5 rounded-lg pl-3 pr-3 text-sm text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground";
const itemActive =
  "bg-sidebar-accent text-sidebar-accent-foreground font-medium";

export function NavItem({ item, collapsed = false }: NavItemProps) {
  const { pathname } = useLocation();

  const childIsActive =
    item.children?.some((c) => pathname === c.url || pathname.startsWith(c.url + "/")) ?? false;

  const isParentActive = childIsActive || pathname === item.url || pathname.startsWith(item.url + "/");

  const [open, setOpen] = useState(isParentActive);

  const hasChildren = !!item.children?.length;

  // ── Collapsed (icon-only) mode ───────────────────────────────────────────

  if (collapsed) {
    return (
      <NavLink to={item.url} className={itemBase} activeClassName={itemActive}>
        <item.icon className="size-4 shrink-0" />
      </NavLink>
    );
  }

  // ── Flat item (no children) ──────────────────────────────────────────────

  if (!hasChildren) {
    return (
      <NavLink to={item.url} className={itemBase} activeClassName={itemActive}>
        <item.icon className="size-4 shrink-0" />
        <span>{item.title}</span>
      </NavLink>
    );
  }

  // ── Parent item with sub-nav ─────────────────────────────────────────────
  // Clicking navigates to the parent URL and toggles the sub-list.

  return (
    <div>
      <NavLink
        to={item.url}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className={cn(
          "flex h-9 w-full items-center gap-2.5 rounded-lg pl-3 pr-3 text-sm text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
          isParentActive && "bg-sidebar-accent text-sidebar-accent-foreground font-medium",
        )}
      >
        <item.icon className="size-4 shrink-0" />
        <span>{item.title}</span>
      </NavLink>

      {/* Sub-item list — expands below the parent row */}
      {open && (
        <div className="mt-0.5 flex flex-col gap-0.5 pl-[22px]">
          {item.children!.map((child) => (
            <NavLink
              key={child.url}
              to={child.url}
              className="group flex h-8 items-center gap-1.5 rounded-lg pl-2 pr-2 text-sm text-sidebar-foreground/60 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
            >
              <CornerDownRight className="size-3 shrink-0 opacity-0 transition-opacity duration-100 group-hover:opacity-50" />
              <span>{child.title}</span>
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
}
