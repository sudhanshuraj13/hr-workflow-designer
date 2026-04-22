import type {
  AutomationDefinition,
  KeyValuePair,
  SimulationLogEntry,
  WorkflowEdge,
  WorkflowNode,
  WorkflowNodeConfigMap,
  WorkflowNodeData,
  WorkflowNodeType,
  WorkflowSnapshot,
  WorkflowValidationIssue
} from "@/features/workflow-designer/types";

const nodeLabels: Record<WorkflowNodeType, string> = {
  start: "Start",
  task: "Task",
  approval: "Approval",
  automation: "Automated Step",
  end: "End"
};

export function createKeyValuePair(seed: number): KeyValuePair {
  return {
    id: `kv_${seed}`,
    key: "",
    value: ""
  };
}

export function createNodeConfig(type: WorkflowNodeType): WorkflowNodeConfigMap[WorkflowNodeType] {
  switch (type) {
    case "start":
      return { title: "Workflow starts", metadata: [] };
    case "task":
      return {
        title: "Collect documents",
        description: "",
        assignee: "",
        dueDate: "",
        customFields: []
      };
    case "approval":
      return {
        title: "Manager approval",
        approverRole: "Manager",
        autoApproveThreshold: 0
      };
    case "automation":
      return {
        title: "Send update",
        actionId: "",
        actionLabel: "",
        actionParams: {}
      };
    case "end":
      return {
        message: "Workflow completed",
        summaryRequired: true
      };
  }
}

export function createWorkflowNode(type: WorkflowNodeType, position: { x: number; y: number }, index: number): WorkflowNode {
  const config = createNodeConfig(type);

  return {
    id: `${type}_${index}`,
    type,
    position,
    data: {
      type,
      label: nodeLabels[type],
      config
    } as WorkflowNodeData
  };
}

export function createStarterWorkflow(): WorkflowSnapshot {
  const start = createWorkflowNode("start", { x: 50, y: 120 }, 1);
  const task = createWorkflowNode("task", { x: 320, y: 120 }, 2);
  const approval = createWorkflowNode("approval", { x: 610, y: 120 }, 3);
  const automation = createWorkflowNode("automation", { x: 900, y: 120 }, 4);
  const end = createWorkflowNode("end", { x: 1190, y: 120 }, 5);

  task.data.config = {
    title: "Collect onboarding documents",
    description: "Gather ID proof, signed NDA, and bank details from the candidate.",
    assignee: "HR Operations",
    dueDate: "2026-04-25",
    customFields: [{ id: "kv_default_task", key: "channel", value: "Portal upload" }]
  };

  approval.data.config = {
    title: "Review submission",
    approverRole: "Manager",
    autoApproveThreshold: 24
  };

  automation.data.config = {
    title: "Generate welcome pack",
    actionId: "generate_doc",
    actionLabel: "Generate Document",
    actionParams: {
      template: "Employee Welcome Kit",
      recipient: "New Joiner"
    }
  };

  end.data.config = {
    message: "Candidate is ready for Day 1",
    summaryRequired: true
  };

  return {
    version: 1,
    nodes: [start, task, approval, automation, end],
    edges: [
      { id: "e_start_task", source: start.id, target: task.id, animated: true },
      { id: "e_task_approval", source: task.id, target: approval.id, animated: true },
      { id: "e_approval_automation", source: approval.id, target: automation.id, animated: true },
      { id: "e_automation_end", source: automation.id, target: end.id, animated: true }
    ]
  };
}

function getInDegree(nodeId: string, edges: WorkflowEdge[]) {
  return edges.filter((edge) => edge.target === nodeId).length;
}

function getOutDegree(nodeId: string, edges: WorkflowEdge[]) {
  return edges.filter((edge) => edge.source === nodeId).length;
}

export function validateWorkflow(nodes: WorkflowNode[], edges: WorkflowEdge[]): WorkflowValidationIssue[] {
  const issues: WorkflowValidationIssue[] = [];
  const starts = nodes.filter((node) => node.type === "start");
  const ends = nodes.filter((node) => node.type === "end");

  if (starts.length !== 1) {
    issues.push({
      id: "start-count",
      message: "Workflow must contain exactly one Start node.",
      severity: "error"
    });
  }

  if (ends.length < 1) {
    issues.push({
      id: "end-count",
      message: "Workflow must contain at least one End node.",
      severity: "error"
    });
  }

  for (const node of nodes) {
    const incoming = getInDegree(node.id, edges);
    const outgoing = getOutDegree(node.id, edges);

    if (node.type === "start" && incoming > 0) {
      issues.push({
        id: `start-incoming-${node.id}`,
        message: "Start node cannot have incoming connections.",
        nodeId: node.id,
        severity: "error"
      });
    }

    if (node.type === "start" && outgoing === 0) {
      issues.push({
        id: `start-outgoing-${node.id}`,
        message: "Start node must connect to the next step.",
        nodeId: node.id,
        severity: "error"
      });
    }

    if (node.type === "end" && outgoing > 0) {
      issues.push({
        id: `end-outgoing-${node.id}`,
        message: "End node cannot have outgoing connections.",
        nodeId: node.id,
        severity: "error"
      });
    }

    if (node.type !== "start" && incoming === 0) {
      issues.push({
        id: `missing-incoming-${node.id}`,
        message: `${node.data.label} is unreachable because nothing points to it.`,
        nodeId: node.id,
        severity: "warning"
      });
    }

    if (node.type !== "end" && outgoing === 0) {
      issues.push({
        id: `missing-outgoing-${node.id}`,
        message: `${node.data.label} does not lead anywhere yet.`,
        nodeId: node.id,
        severity: "warning"
      });
    }

    if (node.type === "task") {
      const config = node.data.config as WorkflowNodeConfigMap["task"];
      if (!config.title.trim()) {
        issues.push({
          id: `task-title-${node.id}`,
          message: "Task node title is required.",
          nodeId: node.id,
          severity: "error"
        });
      }
    }

    if (node.type === "automation") {
      const config = node.data.config as WorkflowNodeConfigMap["automation"];
      if (!config.actionId) {
        issues.push({
          id: `automation-action-${node.id}`,
          message: "Automated Step must select a mock API action.",
          nodeId: node.id,
          severity: "error"
        });
      }
    }
  }

  const cycleNodeIds = detectCycleNodeIds(nodes, edges);
  for (const nodeId of cycleNodeIds) {
    issues.push({
      id: `cycle-${nodeId}`,
      message: "This node is part of a cycle. The sandbox expects an acyclic workflow.",
      nodeId,
      severity: "error"
    });
  }

  return dedupeIssues(issues);
}

function detectCycleNodeIds(nodes: WorkflowNode[], edges: WorkflowEdge[]) {
  const adjacency = new Map<string, string[]>();
  const indegree = new Map<string, number>();

  for (const node of nodes) {
    adjacency.set(node.id, []);
    indegree.set(node.id, 0);
  }

  for (const edge of edges) {
    adjacency.get(edge.source)?.push(edge.target);
    indegree.set(edge.target, (indegree.get(edge.target) ?? 0) + 1);
  }

  const queue = Array.from(indegree.entries())
    .filter(([, degree]) => degree === 0)
    .map(([nodeId]) => nodeId);
  const visited = new Set<string>();

  while (queue.length > 0) {
    const current = queue.shift()!;
    visited.add(current);

    for (const next of adjacency.get(current) ?? []) {
      const nextDegree = (indegree.get(next) ?? 0) - 1;
      indegree.set(next, nextDegree);
      if (nextDegree === 0) {
        queue.push(next);
      }
    }
  }

  return nodes.filter((node) => !visited.has(node.id)).map((node) => node.id);
}

function dedupeIssues(issues: WorkflowValidationIssue[]) {
  const seen = new Set<string>();
  return issues.filter((issue) => {
    if (seen.has(issue.id)) {
      return false;
    }

    seen.add(issue.id);
    return true;
  });
}

export function serializeWorkflow(nodes: WorkflowNode[], edges: WorkflowEdge[]): WorkflowSnapshot {
  return {
    version: 1,
    nodes,
    edges
  };
}

function summarizeMetadata(entries: KeyValuePair[]) {
  return entries
    .filter((entry) => entry.key.trim() || entry.value.trim())
    .map((entry) => `${entry.key || "key"}=${entry.value || "value"}`)
    .join(", ");
}

export function simulateWorkflow(
  snapshot: WorkflowSnapshot,
  automationCatalog: AutomationDefinition[]
): SimulationLogEntry[] {
  const startNode = snapshot.nodes.find((node) => node.type === "start");
  if (!startNode) {
    return [];
  }

  const nextBySource = new Map<string, WorkflowEdge[]>();
  for (const edge of snapshot.edges) {
    const list = nextBySource.get(edge.source) ?? [];
    list.push(edge);
    nextBySource.set(edge.source, list);
  }

  const logs: SimulationLogEntry[] = [];
  const visited = new Set<string>();
  const queue = [startNode.id];

  while (queue.length > 0) {
    const currentNodeId = queue.shift()!;
    if (visited.has(currentNodeId)) {
      continue;
    }

    visited.add(currentNodeId);
    const node = snapshot.nodes.find((entry) => entry.id === currentNodeId);
    if (!node) {
      continue;
    }

    const detail = buildSimulationDetail(node, automationCatalog);
    logs.push({
      id: `log_${logs.length + 1}`,
      nodeId: node.id,
      title: `${logs.length + 1}. ${node.data.label}`,
      detail,
      status: node.type === "approval" ? "waiting" : "success"
    });

    for (const edge of nextBySource.get(currentNodeId) ?? []) {
      queue.push(edge.target);
    }
  }

  return logs;
}

function buildSimulationDetail(node: WorkflowNode, automationCatalog: AutomationDefinition[]) {
  switch (node.type) {
    case "start": {
      const config = node.data.config as WorkflowNodeConfigMap["start"];
      const metadata = summarizeMetadata(config.metadata);
      return metadata ? `${config.title}. Metadata: ${metadata}.` : config.title;
    }
    case "task": {
      const config = node.data.config as WorkflowNodeConfigMap["task"];
      const parts = [
        config.description || "Human task queued.",
        config.assignee ? `Assigned to ${config.assignee}.` : "",
        config.dueDate ? `Due ${config.dueDate}.` : ""
      ];
      return parts.filter(Boolean).join(" ");
    }
    case "approval": {
      const config = node.data.config as WorkflowNodeConfigMap["approval"];
      return `${config.approverRole} review requested. Auto-approve threshold: ${config.autoApproveThreshold} hours.`;
    }
    case "automation": {
      const config = node.data.config as WorkflowNodeConfigMap["automation"];
      const automation = automationCatalog.find((entry) => entry.id === config.actionId);
      const params = Object.entries(config.actionParams)
        .filter(([, value]) => value.trim())
        .map(([key, value]) => `${key}=${value}`)
        .join(", ");
      return `${automation?.label ?? config.title} invoked${params ? ` with ${params}` : ""}.`;
    }
    case "end": {
      const config = node.data.config as WorkflowNodeConfigMap["end"];
      return `${config.message}${config.summaryRequired ? " Summary collection is enabled." : ""}`;
    }
  }
}
