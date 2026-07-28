import type { ComponentType } from "react";
import type { ComponentBlock } from "@/lib/chat/types";
import { KpiCard } from "./components/KpiCard";
import { LedgerTable } from "./components/LedgerTable";
import { DecisionTree } from "./components/DecisionTree";
import { VATBreakdown } from "./components/VATBreakdown";
import { ApprovalCard } from "./components/ApprovalCard";

const REGISTRY: Record<string, ComponentType<Record<string, unknown>>> = {
  KpiCard,
  LedgerTable,
  DecisionTree,
  VATBreakdown,
  ApprovalCard,
};

interface Props {
  block: ComponentBlock;
  threadId: string | null;
  messageId: string;
  fallback?: React.ReactNode;
}

export function ComponentDispatcher({ block, fallback }: Props) {
  const Component = REGISTRY[block.name];
  if (Component) return <Component {...(block.props ?? {})} />;
  if (fallback) return <>{fallback}</>;
  return (
    <div className="rounded-xl border border-dashed border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
      Component <code className="font-mono">{block.name}</code> not registered.
    </div>
  );
}
