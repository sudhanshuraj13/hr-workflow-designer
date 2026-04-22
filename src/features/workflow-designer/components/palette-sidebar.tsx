"use client";

import type { ReactNode } from "react";
import { Bot, ClipboardList, Play, ShieldCheck, Target, WandSparkles } from "lucide-react";

import type { WorkflowNodeType } from "@/features/workflow-designer/types";

const paletteItems: Array<{
  type: WorkflowNodeType;
  title: string;
  description: string;
  icon: ReactNode;
}> = [
  {
    type: "start",
    title: "Start Node",
    description: "Entry point for the workflow.",
    icon: <Play className="h-4 w-4" />
  },
  {
    type: "task",
    title: "Task Node",
    description: "A human action such as collecting documents.",
    icon: <ClipboardList className="h-4 w-4" />
  },
  {
    type: "approval",
    title: "Approval Node",
    description: "A manager or HR decision step.",
    icon: <ShieldCheck className="h-4 w-4" />
  },
  {
    type: "automation",
    title: "Automated Step",
    description: "A mock system action pulled from the API.",
    icon: <Bot className="h-4 w-4" />
  },
  {
    type: "end",
    title: "End Node",
    description: "The final outcome for the workflow.",
    icon: <Target className="h-4 w-4" />
  }
];

type PaletteSidebarProps = {
  onReset: () => void;
};

export function PaletteSidebar({ onReset }: PaletteSidebarProps) {
  return (
    <aside className="space-y-4 rounded-[28px] border border-slate-200 bg-white/90 p-5 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white">
          <WandSparkles className="h-3.5 w-3.5" />
          Node palette
        </div>
        <h2 className="mt-4 text-2xl font-semibold text-slate-950">Build the flow visually</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Drag a node onto the canvas, connect it, then edit its details in the panel on the right.
        </p>
      </div>

      <div className="space-y-3">
        {paletteItems.map((item) => (
          <div
            key={item.type}
            draggable
            onDragStart={(event) => {
              event.dataTransfer.setData("application/reactflow", item.type);
              event.dataTransfer.effectAllowed = "move";
            }}
            className="cursor-grab rounded-[24px] border border-slate-200 bg-slate-50 p-4 transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white"
          >
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-white p-2 text-slate-700 shadow-sm">{item.icon}</div>
              <div>
                <div className="font-semibold text-slate-900">{item.title}</div>
                <div className="text-sm text-slate-600">{item.description}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={onReset}
        className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-900 hover:text-slate-950"
      >
        Reset sample flow
      </button>
    </aside>
  );
}
