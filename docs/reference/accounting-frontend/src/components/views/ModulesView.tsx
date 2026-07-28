import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import invoiceSquirrel from "@/assets/igdrasil-characters/invoice_squirrel.png";
import owlWise from "@/assets/igdrasil-characters/owl_wise.png";
import {
  FolderArchive,
  Receipt,
  PiggyBank,
  TrendingUp,
  Users,
  FileText,
  Scale,
  Flame,
  Snowflake,
} from "lucide-react";

interface ModuleItem {
  title: string;
  description: string;
  icon: React.ReactNode;
  world: string;
  route?: string;
  status: "active" | "coming-soon" | "beta";
}

const modules: ModuleItem[] = [
  {
    title: "Chat Assistant",
    description: "Ratatoskr — the messenger squirrel. Ask questions about your finances and get instant answers.",
    icon: <img src={owlWise} alt="Owl" className="h-7 w-7 object-contain" />,
    world: "Midgard",
    route: "/chat",
    status: "active",
  },
  {
    title: "Bookkeeping Review",
    description: "The Eagle's eye view. Automated invoice analysis with smart categorisation and approval flows.",
    icon: <img src={invoiceSquirrel} alt="Squirrel" className="h-7 w-7 object-contain" />,
    world: "Asgard",
    route: "/bookkeeping",
    status: "active",
  },
  {
    title: "File Archive",
    description: "Yggdrasil's roots. Organised document storage with tagging, search, and version history.",
    icon: <FolderArchive className="h-7 w-7 text-emerald-600" />,
    world: "Helheim",
    route: "/files",
    status: "active",
  },
  {
    title: "Expense Tracker",
    description: "Eikþyrnir the deer. Track and categorise every business expense with receipt capture.",
    icon: <Receipt className="h-7 w-7 text-orange-500" />,
    world: "Alfheim",
    status: "coming-soon",
  },
  {
    title: "Tax Planner",
    description: "Níðhöggr's foresight. Proactive tax estimation, deadline tracking, and deduction optimisation.",
    icon: <Scale className="h-7 w-7 text-violet-600" />,
    world: "Svartalfheim",
    status: "coming-soon",
  },
  {
    title: "Cash Flow",
    description: "Muspelheim's fire. Real-time cash flow monitoring and forecasting to keep your business burning bright.",
    icon: <Flame className="h-7 w-7 text-red-500" />,
    world: "Muspelheim",
    status: "coming-soon",
  },
  {
    title: "Payroll",
    description: "Vanaheim's harmony. Simplified payroll management for your team with automated calculations.",
    icon: <Users className="h-7 w-7 text-teal-600" />,
    world: "Vanaheim",
    status: "coming-soon",
  },
  {
    title: "Financial Reports",
    description: "Jötunheim's strength. Generate P&L, balance sheets, and custom reports with one click.",
    icon: <TrendingUp className="h-7 w-7 text-indigo-500" />,
    world: "Jotunheim",
    status: "coming-soon",
  },
  {
    title: "Invoice Generator",
    description: "Niflheim's precision. Create, send, and track professional invoices with automated reminders.",
    icon: <FileText className="h-7 w-7 text-cyan-600" />,
    world: "Niflheim",
    status: "coming-soon",
  },
  {
    title: "Savings Goals",
    description: "The well of Urðr. Set financial goals, track progress, and build reserves for your business.",
    icon: <PiggyBank className="h-7 w-7 text-pink-500" />,
    world: "Alfheim",
    status: "coming-soon",
  },
  {
    title: "Frost Audit",
    description: "Niflheim's chill. Cold-start audit tooling for compliance checks and year-end preparation.",
    icon: <Snowflake className="h-7 w-7 text-blue-400" />,
    world: "Niflheim",
    status: "coming-soon",
  },
];

const statusConfig = {
  active: { label: "Active", variant: "default" as const },
  beta: { label: "Beta", variant: "secondary" as const },
  "coming-soon": { label: "Coming Soon", variant: "outline" as const },
};

export const ModulesView = () => {
  const navigate = useNavigate();

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 p-6 md:p-10">
      {/* Header */}
      <div className="max-w-2xl">
        <h1
          className="text-3xl text-foreground md:text-4xl"
        >
          Igdrasil Toolkit
        </h1>
        <p className="mt-2 text-muted-foreground">
          Open-source accounting tools for modern businesses. Each module maps
          to one of the nine worlds — pick what you need, leave what you don't.
        </p>
        <div className="mt-3 flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            3 active modules
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
            {modules.filter((m) => m.status === "coming-soon").length} on the
            roadmap
          </span>
        </div>
      </div>

      {/* Module Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {modules.map((mod) => {
          const cfg = statusConfig[mod.status];
          const isClickable = !!mod.route;

          return (
            <Card
              key={mod.title}
              className={`group relative transition-all duration-200 ${
                isClickable
                  ? "cursor-pointer hover:border-primary/40 hover:shadow-md"
                  : "opacity-75"
              }`}
              onClick={() => mod.route && navigate(mod.route)}
            >
              <CardContent className="flex gap-4 p-5">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-border bg-background">
                  {mod.icon}
                </div>
                <div className="flex min-w-0 flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">
                      {mod.title}
                    </span>
                    <Badge variant={cfg.variant} className="text-[10px] px-1.5 py-0">
                      {cfg.label}
                    </Badge>
                  </div>
                  <span className="text-[11px] font-mono uppercase text-muted-foreground/60">
                    {mod.world}
                  </span>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    {mod.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Footer */}
      <div className="border-t border-border pt-6">
        <p className="text-xs text-muted-foreground">
          Built with transparency in mind. All modules are designed to be
          composable — use them independently or together.{" "}
          <span className="font-mono text-foreground/60">v0.1.0-alpha</span>
        </p>
      </div>
    </div>
  );
};
