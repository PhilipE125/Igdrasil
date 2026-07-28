import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useCompany } from "@/contexts/CompanyContext";
import { useAuth } from "@/contexts/AuthContext";
import {
  Building2,
  User,
  Plug,
  BarChart3,
  LayoutDashboard,
  Search,
  Zap,
} from "lucide-react";

const SETTINGS_NAV = [
  { label: "Dashboard", href: "/settings/dashboard", icon: LayoutDashboard },
  { label: "Företagsprofil", href: "/settings/company", icon: Building2 },
  { label: "Användarprofil", href: "/settings/user", icon: User },
  { label: "Integrationer", href: "/settings/integrations", icon: Plug },
  { label: "Automatiseringar", href: "/settings/automations", icon: Zap },
  { label: "Tokenanvändning", href: "/settings/usage", icon: BarChart3 },
];

export function SettingsLayout() {
  const { pathname } = useLocation();
  const { activeCompany } = useCompany();
  const { user } = useAuth();
  const [search, setSearch] = useState("");

  const companyInitials = (activeCompany?.name ?? "?").slice(0, 3).toUpperCase();
  const filteredNav = search
    ? SETTINGS_NAV.filter((item) => item.label.toLowerCase().includes(search.toLowerCase()))
    : SETTINGS_NAV;

  return (
    <div className="mx-auto flex w-full max-w-[1100px] items-start gap-6 p-6">
      {/* ── Settings sidebar (floating card) ── */}
      <Card className="w-[260px] shrink-0 sticky top-6 flex flex-col overflow-hidden">
        {/* Company header */}
        <div className="px-4 pt-4 pb-3">
          <div className="flex items-center gap-3">
            <Avatar className="size-10 rounded-lg">
              <AvatarFallback className="rounded-lg text-xs font-semibold">
                {companyInitials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold truncate">{activeCompany?.name ?? "Inget företag"}</p>
              <p className="text-xs text-muted-foreground truncate">
                {activeCompany?.org_number ?? "Inställningar"}
              </p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="px-3 pb-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              className="h-8 pl-8 text-xs"
              placeholder="Sök inställningar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-2 pb-2" aria-label="Settings menu">
          <ul className="space-y-0.5">
            {filteredNav.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    to={item.href}
                    className={cn(
                      "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors",
                      isActive
                        ? "bg-accent text-accent-foreground font-medium"
                        : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
                    )}
                  >
                    <Icon className="size-4 shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer: user info */}
        <Separator />
        <div className="px-4 py-3">
          <div className="flex items-center gap-2.5">
            <Avatar className="size-7">
              <AvatarFallback className="text-[10px]">
                {(user?.email ?? "?").slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium truncate">{user?.email?.split("@")[0]}</p>
              <p className="text-[10px] text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* ── Settings content area ── */}
      <div className="flex-1 min-w-0">
        <Outlet />
      </div>
    </div>
  );
}
