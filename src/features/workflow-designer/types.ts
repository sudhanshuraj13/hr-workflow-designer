import type { Edge, Node } from "@xyflow/react";

export type WorkflowNodeType = "start" | "task" | "approval" | "automation" | "end";

export type KeyValuePair = {
  id: string;
  key: string;
  value: string;
};

export type AutomationDefinition = {
  id: string;
  label: string;
  params: string[];
};

export type StartNodeConfig = {
  title: string;
  metadata: KeyValuePair[];
};

export type TaskNodeConfig = {
  title: string;
  description: string;
  assignee: string;
  dueDate: string;
  customFields: KeyValuePair[];
};

export type ApprovalNodeConfig = {
  title: string;
  approverRole: string;
  autoApproveThreshold: number;
};

export type AutomationNodeConfig = {
  title: string;
  actionId: string;
  actionLabel: string;
  actionParams: Record<string, string>;
};

export type EndNodeConfig = {
  message: string;
  summaryRequired: boolean;
};

export type WorkflowNodeConfigMap = {
  start: StartNodeConfig;
  task: TaskNodeConfig;
  approval: ApprovalNodeConfig;
  automation: AutomationNodeConfig;
  end: EndNodeConfig;
};

export type WorkflowNodeData<T extends WorkflowNodeType = WorkflowNodeType> = {
  type: T;
  label: string;
  config: WorkflowNodeConfigMap[T];
  validationMessages?: string[];
};

export type WorkflowNode<T extends WorkflowNodeType = WorkflowNodeType> = Node<WorkflowNodeData<T>, T>;
export type WorkflowEdge = Edge;

export type WorkflowValidationIssue = {
  id: string;
  message: string;
  nodeId?: string;
  edgeId?: string;
  severity: "error" | "warning";
};

export type WorkflowSnapshot = {
  version: number;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
};

export type SimulationLogEntry = {
  id: string;
  nodeId: string;
  title: string;
  detail: string;
  status: "success" | "waiting";
};

export type SimulationResponse = {
  ok: boolean;
  issues: WorkflowValidationIssue[];
  logs: SimulationLogEntry[];
  snapshot: WorkflowSnapshot;
};
