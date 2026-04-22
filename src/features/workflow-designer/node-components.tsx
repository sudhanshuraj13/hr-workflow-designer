"use client";

import { memo, type ReactNode } from "react";
import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";
import { Bot, CircleCheckBig, ClipboardList, Play, ShieldCheck, TimerReset } from "lucide-react";

import type { AutomationNodeConfig, ApprovalNodeConfig, EndNodeConfig, StartNodeConfig, TaskNodeConfig, WorkflowNodeData, WorkflowNodeType } from "@/features/workflow-designer/types";

const nodeTheme: Record<WorkflowNodeType, { icon: ReactNode; accent: string; badge: string }> = {
  start: {
    icon: <Play className="h-4 w-4" />,
    accent: "from-emerald-500 to-teal-500",
    badge: "Entry"
  },
  task: {
    icon: <ClipboardList className="h-4 w-4" />,
    accent: "from-sky-500 to-cyan-500",
    badge: "Human task"
  },
  approval: {
    icon: <ShieldCheck className="h-4 w-4" />,
    accent: "from-amber-500 to-orange-500",
    badge: "Decision"
  },
  automation: {
    icon: <Bot className="h-4 w-4" />,
    accent: "from-fuchsia-500 to-pink-500",
    badge: "System step"
  },
  end: {
    icon: <CircleCheckBig className="h-4 w-4" />,
    accent: "from-slate-700 to-slate-900",
    badge: "Outcome"
  }
};

function summaryForNode(data: WorkflowNodeData) {
  switch (data.type) {
    case "start":
      return (data.config as StartNodeConfig).title;
    case "task":
      return (data.config as TaskNodeConfig).assignee ? `Owner: ${(data.config as TaskNodeConfig).assignee}` : "Human task";
    case "approval":
      return `Approver: ${(data.config as ApprovalNodeConfig).approverRole}`;
    case "automation":
      return (data.config as AutomationNodeConfig).actionLabel || "Choose a mock action";
    case "end":
      return (data.config as EndNodeConfig).summaryRequired ? "Summary enabled" : "Summary optional";
  }
}

function BaseNode({ data, selected }: NodeProps<Node<WorkflowNodeData>>) {
  const theme = nodeTheme[data.type as WorkflowNodeType];
  const messages = Array.isArray(data.validationMessages) ? data.validationMessages : [];

  return (
    <div
      className={`min-w-[220px] rounded-[28px] border bg-white p-4 shadow-[0_20px_40px_rgba(15,23,42,0.12)] transition ${
        selected ? "border-slate-900 ring-4 ring-slate-900/10" : "border-slate-200"
      }`}
    >
      <Handle type="target" position={Position.Left} className="!h-3 !w-3 !border-2 !border-white !bg-slate-400" />
      <div className="flex items-start justify-between gap-3">
        <div className={`inline-flex rounded-2xl bg-gradient-to-br ${theme.accent} p-2 text-white`}>{theme.icon}</div>
        <div className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-600">
          {theme.badge}
        </div>
      </div>
      <div className="mt-4 text-lg font-semibold text-slate-900">{data.label}</div>
      <div className="mt-2 text-sm leading-6 text-slate-600">{summaryForNode(data as WorkflowNodeData)}</div>

      {messages.length > 0 ? (
        <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
          <div className="flex items-center gap-2 font-semibold">
            <TimerReset className="h-3.5 w-3.5" />
            Validation
          </div>
          <div className="mt-2 space-y-1">
            {messages.slice(0, 2).map((message) => (
              <div key={message}>{message}</div>
            ))}
          </div>
        </div>
      ) : null}

      <Handle type="source" position={Position.Right} className="!h-3 !w-3 !border-2 !border-white !bg-slate-400" />
    </div>
  );
}

export const StartNode = memo(BaseNode);
export const TaskNode = memo(BaseNode);
export const ApprovalNode = memo(BaseNode);
export const AutomationNode = memo(BaseNode);
export const EndNode = memo(BaseNode);

export const workflowNodeTypes = {
  start: StartNode,
  task: TaskNode,
  approval: ApprovalNode,
  automation: AutomationNode,
  end: EndNode
};
