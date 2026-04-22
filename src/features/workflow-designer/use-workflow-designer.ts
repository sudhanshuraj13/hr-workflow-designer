"use client";

import { useMemo, useState } from "react";
import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  type Connection,
  type EdgeChange,
  type NodeChange
} from "@xyflow/react";

import type { WorkflowEdge, WorkflowNode, WorkflowNodeData, WorkflowNodeType, WorkflowSnapshot, WorkflowValidationIssue } from "@/features/workflow-designer/types";
import { createStarterWorkflow, createWorkflowNode, serializeWorkflow, validateWorkflow } from "@/features/workflow-designer/utils";

function annotateNodes(nodes: WorkflowNode[], issues: WorkflowValidationIssue[]) {
  return nodes.map((node) => ({
    ...node,
    data: {
      ...(node.data as WorkflowNodeData),
      validationMessages: issues.filter((issue) => issue.nodeId === node.id).map((issue) => issue.message)
    }
  }));
}

export function useWorkflowDesigner() {
  const starter = useMemo(() => createStarterWorkflow(), []);
  const [rawNodes, setRawNodes] = useState<WorkflowNode[]>(starter.nodes);
  const [edges, setEdges] = useState<WorkflowEdge[]>(starter.edges);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(starter.nodes[1]?.id ?? null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const issues = useMemo(() => validateWorkflow(rawNodes, edges), [rawNodes, edges]);
  const nodes = useMemo(() => annotateNodes(rawNodes, issues), [rawNodes, issues]);

  const selectedNode = nodes.find((node) => node.id === selectedNodeId) ?? null;
  const selectedEdge = edges.find((edge) => edge.id === selectedEdgeId) ?? null;

  function onNodesChange(changes: NodeChange<WorkflowNode>[]) {
    setRawNodes((current) => applyNodeChanges(changes, current));
  }

  function onEdgesChange(changes: EdgeChange<WorkflowEdge>[]) {
    setEdges((current) => applyEdgeChanges(changes, current));
  }

  function onConnect(connection: Connection) {
    setEdges((current) =>
      addEdge(
        {
          ...connection,
          id: `e_${connection.source}_${connection.target}_${current.length + 1}`,
          animated: true
        },
        current
      )
    );
  }

  function addNode(type: WorkflowNodeType, position: { x: number; y: number }) {
    setRawNodes((current) => {
      const nextNode = createWorkflowNode(type, position, current.length + 1);
      setSelectedNodeId(nextNode.id);
      setSelectedEdgeId(null);
      return [...current, nextNode];
    });
  }

  function updateSelectedNodeData(updater: (node: WorkflowNode) => WorkflowNode) {
    if (!selectedNodeId) {
      return;
    }

    setRawNodes((current) => current.map((node) => (node.id === selectedNodeId ? updater(node) : node)));
  }

  function selectNode(nodeId: string | null) {
    setSelectedNodeId(nodeId);
    setSelectedEdgeId(null);
  }

  function selectEdge(edgeId: string | null) {
    setSelectedEdgeId(edgeId);
    setSelectedNodeId(null);
  }

  function deleteSelection() {
    if (selectedNodeId) {
      setRawNodes((current) => current.filter((node) => node.id !== selectedNodeId));
      setEdges((current) => current.filter((edge) => edge.source !== selectedNodeId && edge.target !== selectedNodeId));
      setSelectedNodeId(null);
    }

    if (selectedEdgeId) {
      setEdges((current) => current.filter((edge) => edge.id !== selectedEdgeId));
      setSelectedEdgeId(null);
    }
  }

  function resetToStarter() {
    const next = createStarterWorkflow();
    setRawNodes(next.nodes);
    setEdges(next.edges);
    setSelectedNodeId(next.nodes[1]?.id ?? null);
    setSelectedEdgeId(null);
  }

  function importSnapshot(snapshot: WorkflowSnapshot) {
    setRawNodes(snapshot.nodes);
    setEdges(snapshot.edges);
    setSelectedNodeId(snapshot.nodes[0]?.id ?? null);
    setSelectedEdgeId(null);
  }

  return {
    nodes,
    edges,
    issues,
    selectedNode,
    selectedEdge,
    addNode,
    onNodesChange,
    onEdgesChange,
    onConnect,
    selectNode,
    selectEdge,
    updateSelectedNodeData,
    deleteSelection,
    resetToStarter,
    serialize: () => serializeWorkflow(nodes, edges),
    importSnapshot
  };
}
