import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getPipelineRunByProcess, type PipelineRun } from "@/lib/uploadApi";

export type NodeStatus = "idle" | "running" | "completed" | "failed";

function deriveNodeStatuses(
  run: PipelineRun | undefined,
): Record<string, NodeStatus> {
  if (!run) return {};
  const history: string[] = Array.isArray(run.node_history) ? run.node_history : [];
  const statuses: Record<string, NodeStatus> = {};
  const isRunning = run.status === "running";

  history.forEach((nodeId, idx) => {
    const isLast = idx === history.length - 1;
    if (nodeId === "flag_document") {
      statuses[nodeId] = "failed";
    } else if (isRunning && isLast) {
      statuses[nodeId] = "running";
    } else {
      statuses[nodeId] = "completed";
    }
  });

  return statuses;
}

export function useActiveRun(processId: string | null): {
  run: PipelineRun | null;
  nodeStatuses: Record<string, NodeStatus>;
} {
  const { data: run } = useQuery({
    queryKey: ["pipeline-run-by-process", processId],
    queryFn: () => getPipelineRunByProcess(processId!),
    enabled: !!processId,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status === "completed" || status === "failed") return false;
      return 3_000;
    },
    retry: false,
  });

  // Memoized so the returned object reference is stable when run hasn't changed,
  // preventing the canvas useEffect from firing on every poll cycle.
  const nodeStatuses = useMemo(() => deriveNodeStatuses(run), [run]);

  return { run: run ?? null, nodeStatuses };
}
