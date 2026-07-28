import { useState } from "react";
import { Sparkles, Workflow } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AccountingAutomationTabs } from "./AccountingAutomationTabs";
import { BookkeepingReviewView } from "./BookkeepingReviewView";
import { PipelineBuilderView } from "./PipelineBuilderView";

export function AccountingAutomationsLegacyView() {
  const [legacyTab, setLegacyTab] = useState("kanban");

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="space-y-2">
        <Badge variant="outline" className="rounded-full border-primary/20 bg-primary/5 text-primary">
          Accounting Automations
        </Badge>
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Legacy automation workspace</h1>
          <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
            Older kanban review and pipeline builder flows remain available here while the new table-first automations workspace becomes the default.
          </p>
        </div>
      </div>

      <AccountingAutomationTabs activeTab="legacy" />

      <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-4 text-sm text-muted-foreground">
        Legacy keeps the old kanban and pipeline builder available as a separate route so navigation behaves consistently with Documents and Review.
      </div>

      <Tabs value={legacyTab} onValueChange={setLegacyTab} className="flex flex-1 flex-col gap-4">
        <TabsList className="w-fit">
          <TabsTrigger value="kanban">
            <Sparkles className="mr-2 h-4 w-4" />
            Kanban Review
          </TabsTrigger>
          <TabsTrigger value="pipeline">
            <Workflow className="mr-2 h-4 w-4" />
            Pipeline Builder
          </TabsTrigger>
        </TabsList>
        <TabsContent value="kanban" className="mt-0 min-h-0 flex-1 overflow-hidden rounded-2xl border">
          <BookkeepingReviewView />
        </TabsContent>
        <TabsContent value="pipeline" className="mt-0 min-h-0 flex-1 overflow-hidden rounded-2xl border">
          <PipelineBuilderView />
        </TabsContent>
      </Tabs>
    </div>
  );
}
