"use client";

import { useEffect, useState } from "react";
import { Boxes, Network, ScanSearch, Sparkles } from "lucide-react";

import { InspectorPanel } from "@/features/workflow-designer/components/inspector-panel";
import { PaletteSidebar } from "@/features/workflow-designer/components/palette-sidebar";
import { SandboxPanel } from "@/features/workflow-designer/components/sandbox-panel";
import { WorkflowCanvas } from "@/features/workflow-designer/components/workflow-canvas";
import type { AutomationDefinition } from "@/features/workflow-designer/types";
import { useWorkflowDesigner } from "@/features/workflow-designer/use-workflow-designer";

const capabilityCards = [
  {
    icon: <Network className="h-5 w-5" />,
    title: "React Flow canvas",
    description: "Custom nodes, edge management, drag-and-drop, deletion, and minimap support."
  },
  {
    icon: <Boxes className="h-5 w-5" />,
    title: "Configurable node forms",
    description: "Each node type exposes a dedicated editor, including dynamic automation parameters."
  },
  {
    icon: <ScanSearch className="h-5 w-5" />,
    title: "Mock API sandbox",
    description: "Automations are fetched through the API layer and simulated through a separate endpoint."
  }
];

export function DesignerShell() {
  const workflow = useWorkflowDesigner();
  const [automations, setAutomations] = useState<AutomationDefinition[]>([]);

  useEffect(() => {
    void fetch("/api/automations")
      .then((response) => response.json())
      .then((data) => setAutomations(data.automations ?? []))
      .catch(() => setAutomations([]));
  }, []);

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_45%,_#f8fafc_100%)] px-4 py-6 text-slate-900">
      <div className="mx-auto max-w-[1600px]">
        <section className="overflow-hidden rounded-[36px] border border-slate-200 bg-white/80 px-6 py-8 shadow-[0_30px_80px_rgba(15,23,42,0.08)] backdrop-blur lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-white">
                <Sparkles className="h-3.5 w-3.5" />
                HR Workflow Designer
              </div>
              <h1 className="mt-5 max-w-3xl text-4xl font-semibold leading-tight text-slate-950 md:text-6xl">
                A submission-ready workflow builder for onboarding, approvals, and internal HR automation.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 md:text-lg">
                The prototype is structured around reusable canvas state, extensible node configuration forms, and a mock API
                sandbox so reviewers can see both product thinking and implementation discipline.
              </p>
            </div>

            <div className="grid gap-4">
              {capabilityCards.map((card) => (
                <div key={card.title} className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
                  <div className="inline-flex rounded-2xl bg-white p-2 text-slate-800 shadow-sm">{card.icon}</div>
                  <div className="mt-4 text-lg font-semibold text-slate-950">{card.title}</div>
                  <div className="mt-2 text-sm leading-6 text-slate-600">{card.description}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)_360px]">
          <PaletteSidebar onReset={workflow.resetToStarter} />

          <div className="space-y-6">
            <WorkflowCanvas
              nodes={workflow.nodes}
              edges={workflow.edges}
              selectedEdge={workflow.selectedEdge}
              onNodesChange={workflow.onNodesChange}
              onEdgesChange={workflow.onEdgesChange}
              onConnect={workflow.onConnect}
              onNodeSelect={workflow.selectNode}
              onEdgeSelect={workflow.selectEdge}
              onClearSelection={workflow.clearSelection}
              onDeleteSelection={workflow.deleteSelection}
              onAddNode={workflow.addNode}
            />
            <SandboxPanel snapshot={workflow.serialize()} issues={workflow.issues} onImport={workflow.importSnapshot} />
          </div>

          <InspectorPanel
            selectedNode={workflow.selectedNode}
            selectedEdge={workflow.selectedEdge}
            automations={automations}
            onDelete={workflow.deleteSelection}
            onUpdate={workflow.updateSelectedNodeData}
          />
        </section>
      </div>
    </main>
  );
}
