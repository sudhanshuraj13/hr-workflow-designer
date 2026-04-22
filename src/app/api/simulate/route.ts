import { NextResponse } from "next/server";

import { automationDefinitions } from "@/features/workflow-designer/mock-data";
import type { WorkflowSnapshot } from "@/features/workflow-designer/types";
import { simulateWorkflow, validateWorkflow } from "@/features/workflow-designer/utils";

export async function POST(request: Request) {
  const snapshot = (await request.json()) as WorkflowSnapshot;
  const issues = validateWorkflow(snapshot.nodes, snapshot.edges);
  const logs = issues.some((issue) => issue.severity === "error") ? [] : simulateWorkflow(snapshot, automationDefinitions);

  return NextResponse.json({
    ok: issues.every((issue) => issue.severity !== "error"),
    issues,
    logs,
    snapshot
  });
}
