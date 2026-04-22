"use client";

import { useCallback } from "react";
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
  onNodesChange: Parameters<typeof ReactFlow<WorkflowNode, WorkflowEdge>>[0]["onNodesChange"];
  onEdgesChange: Parameters<typeof ReactFlow<WorkflowNode, WorkflowEdge>>[0]["onEdgesChange"];
  onConnect: Parameters<typeof ReactFlow<WorkflowNode, WorkflowEdge>>[0]["onConnect"];
  onNodeSelect: (nodeId: string | null) => void;
  onEdgeSelect: (edgeId: string | null) => void;
  onAddNode: (type: WorkflowNodeType, position: { x: number; y: number }) => void;
};

function WorkflowCanvasInner({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onNodeSelect,
  onEdgeSelect,
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
    <div className="h-[640px] overflow-hidden rounded-[32px] border border-slate-200 bg-[radial-gradient(circle_at_top_left,_rgba(148,163,184,0.1),_transparent_30%),linear-gradient(180deg,_#ffffff,_#f8fafc)]">
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
        onPaneClick={() => onNodeSelect(null)}
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
