import { useNavigate } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type AutomationTab = "documents" | "review" | "legacy";

const TAB_ROUTES: Record<AutomationTab, string> = {
  documents: "/accounting/automations",
  review: "/accounting/automations/review",
  legacy: "/accounting/automations/legacy",
};

// Polaris-style segmented tabs — single container, individual tabs share the chrome
const polarisTabTrigger =
  "inline-flex h-7 items-center rounded-md px-3 text-[13px] font-medium text-foreground/65 transition-colors hover:text-foreground data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-[0_1px_0_rgba(0,0,0,0.04)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-border";

export function AccountingAutomationTabs({ activeTab }: { activeTab: AutomationTab }) {
  const navigate = useNavigate();

  return (
    <Tabs
      value={activeTab}
      onValueChange={(value) => navigate(TAB_ROUTES[value as AutomationTab])}
      className="flex flex-col gap-4"
    >
      <TabsList className="inline-flex h-9 w-fit items-center gap-1 rounded-lg border border-border/80 bg-muted/40 p-1 shadow-[0_1px_0_rgba(0,0,0,0.04)]">
        <TabsTrigger value="documents" className={polarisTabTrigger}>Inbox</TabsTrigger>
        <TabsTrigger value="review" className={polarisTabTrigger}>Review</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
