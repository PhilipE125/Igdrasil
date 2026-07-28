import { useMemo } from "react";
import {
  LayoutDashboard,
  FolderArchive,
  Landmark,
  BarChart3,
  FileBarChart2,
  ShieldCheck,
} from "lucide-react";
import { EagleIcon } from "@/components/icons/EagleIcon";
import { NavMain, type NavMainItem } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { useDashboardPrefs } from "@/lib/hooks/useDashboardPrefs";

const platformItems: NavMainItem[] = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  {
    title: "Accounting",
    url: "/accounting/automations",
    icon: EagleIcon,
    items: [
      { title: "Automations", url: "/accounting/automations" },
      { title: "Customers", url: "/accounting/customers" },
      { title: "Suppliers", url: "/accounting/suppliers" },
      { title: "Employees", url: "/accounting/employees" },
      { title: "Ledger", url: "/accounting/ledger" },
    ],
  },
];

const baseDataItems: NavMainItem[] = [
  { title: "File Archive", url: "/files", icon: FolderArchive },
  { title: "Bank Transactions", url: "/bank-transactions", icon: Landmark },
  {
    title: "Reports",
    url: "/reports/financial",
    icon: FileBarChart2,
    items: [
      { title: "Financial Position", url: "/reports/financial" },
      { title: "Regulatory", url: "/reports/regulatory" },
      { title: "Custom", url: "/reports/custom" },
    ],
  },
];

const auditTrailItem: NavMainItem = { title: "Audit Trail", url: "/audit-trail", icon: ShieldCheck };

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  onAddCompany: () => void;
}

export function AppSidebar({ onAddCompany, ...props }: AppSidebarProps) {
  const { showAuditTrail } = useDashboardPrefs();
  const dataItems = useMemo(
    () => (showAuditTrail ? [...baseDataItems, auditTrailItem] : baseDataItems),
    [showAuditTrail],
  );

  return (
    <Sidebar collapsible="none" {...props}>
      <SidebarHeader>
        <TeamSwitcher onAddCompany={onAddCompany} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain label="Platform" items={platformItems} />
        <NavMain label="Data" items={dataItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
