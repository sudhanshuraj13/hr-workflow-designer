"use client";

import { useCallback } from "react";
import { Trash2 } from "lucide-react";
import {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { workflowNodeTypes } from "@/features/workflow-designer/node-components";
import type { WorkflowEdge, WorkflowNode, WorkflowNodeType } from "@/features/workflow-designer/types";

type WorkflowCanvasInnerProps = {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  selectedEdge: WorkflowEdge | null;
  onNodesChange: Parameters<typeof ReactFlow<WorkflowNode, WorkflowEdge>>[0]["onNodesChange"];
  onEdgesChange: Parameters<typeof ReactFlow<WorkflowNode, WorkflowEdge>>[0]["onEdgesChange"];
  onConnect: Parameters<typeof ReactFlow<WorkflowNode, WorkflowEdge>>[0]["onConnect"];
  onNodeSelect: (nodeId: string | null) => void;
  onEdgeSelect: (edgeId: string | null) => void;
  onClearSelection: () => void;
  onDeleteSelection: () => void;
  onAddNode: (type: WorkflowNodeType, position: { x: number; y: number }) => void;
};

function WorkflowCanvasInner({
  nodes,
  edges,
  selectedEdge,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onNodeSelect,
  onEdgeSelect,
  onClearSelection,
  onDeleteSelection,
  onAddNode
}: WorkflowCanvasInnerProps) {
  const { screenToFlowPosition } = useReactFlow();

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      const type = event.dataTransfer.getData("application/reactflow") as WorkflowNodeType;
      if (!type) {
        return;
      }

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY
      });

      onAddNode(type, position);
    },
    [onAddNode, screenToFlowPosition]
  );

  return (
    <div className="relative h-[640px] overflow-hidden rounded-[32px] border border-slate-200 bg-[radial-gradient(circle_at_top_left,_rgba(148,163,184,0.1),_transparent_30%),linear-gradient(180deg,_#ffffff,_#f8fafc)]">
      {selectedEdge ? (
        <div className="pointer-events-none absolute left-4 right-4 top-4 z-20 flex justify-center">
          <div className="pointer-events-auto flex items-center gap-3 rounded-2xl border border-rose-200 bg-white/95 px-4 py-3 shadow-lg backdrop-blur">
            <div className="text-sm text-slate-700">
              Selected connection: <span className="font-semibold text-slate-950">{selectedEdge.source}</span> to{" "}
              <span className="font-semibold text-slate-950">{selectedEdge.target}</span>
            </div>
            <button
              type="button"
              onClick={onDeleteSelection}
              className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700 transition hover:border-rose-300"
            >
              <Trash2 className="h-4 w-4" />
              Delete line
            </button>
          </div>
        </div>
      ) : null}

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={(event) => {
          event.preventDefault();
          event.dataTransfer.dropEffect = "move";
        }}
        onNodeClick={(_, node) => onNodeSelect(node.id)}
        onPaneClick={onClearSelection}
        onEdgeClick={(_, edge) => onEdgeSelect(edge.id)}
        nodeTypes={workflowNodeTypes}
        fitView
        deleteKeyCode={["Backspace", "Delete"]}
        proOptions={{ hideAttribution: true }}
        className="workflow-canvas"
      >
        <MiniMap pannable zoomable className="!rounded-2xl !border !border-slate-200 !bg-white" />
        <Controls className="!overflow-hidden !rounded-2xl !border !border-slate-200 !bg-white" />
        <Background variant={BackgroundVariant.Dots} gap={18} size={1.2} color="#cbd5e1" />
      </ReactFlow>
    </div>
  );
}

export function WorkflowCanvas(props: WorkflowCanvasInnerProps) {
  return (
    <ReactFlowProvider>
      <WorkflowCanvasInner {...props} />
    </ReactFlowProvider>
  );
}
