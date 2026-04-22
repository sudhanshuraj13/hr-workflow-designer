"use client";

import type { ChangeEvent } from "react";
import { Settings2, Trash2 } from "lucide-react";

import type {
  AutomationDefinition,
  KeyValuePair,
  WorkflowEdge,
  WorkflowNode,
  WorkflowNodeConfigMap
} from "@/features/workflow-designer/types";
import { createKeyValuePair } from "@/features/workflow-designer/utils";

type InspectorPanelProps = {
  selectedNode: WorkflowNode | null;
  selectedEdge: WorkflowEdge | null;
  automations: AutomationDefinition[];
  onDelete: () => void;
  onUpdate: (updater: (node: WorkflowNode) => WorkflowNode) => void;
};

function SectionTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div>
      <div className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">{title}</div>
      <div className="mt-1 text-sm leading-6 text-slate-600">{subtitle}</div>
    </div>
  );
}

function Input({ value, onChange, placeholder, type = "text" }: { value: string | number; onChange: (event: ChangeEvent<HTMLInputElement>) => void; placeholder?: string; type?: string }) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
    />
  );
}

function TextArea({ value, onChange, placeholder }: { value: string; onChange: (event: ChangeEvent<HTMLTextAreaElement>) => void; placeholder?: string }) {
  return (
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="min-h-28 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
    />
  );
}

function KeyValueEditor({
  rows,
  onChange
}: {
  rows: KeyValuePair[];
  onChange: (rows: KeyValuePair[]) => void;
}) {
  return (
    <div className="space-y-3">
      {rows.map((row) => (
        <div key={row.id} className="grid grid-cols-[1fr_1fr_auto] gap-2">
          <Input
            value={row.key}
            placeholder="Key"
            onChange={(event) => onChange(rows.map((entry) => (entry.id === row.id ? { ...entry, key: event.target.value } : entry)))}
          />
          <Input
            value={row.value}
            placeholder="Value"
            onChange={(event) => onChange(rows.map((entry) => (entry.id === row.id ? { ...entry, value: event.target.value } : entry)))}
          />
          <button
            type="button"
            onClick={() => onChange(rows.filter((entry) => entry.id !== row.id))}
            className="rounded-2xl border border-slate-200 px-3 text-sm text-slate-600 transition hover:border-slate-900 hover:text-slate-950"
          >
            Remove
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...rows, createKeyValuePair(Date.now())])}
        className="rounded-2xl border border-dashed border-slate-300 px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-900 hover:text-slate-950"
      >
        Add field
      </button>
    </div>
  );
}

export function InspectorPanel({ selectedNode, selectedEdge, automations, onDelete, onUpdate }: InspectorPanelProps) {
  if (!selectedNode && !selectedEdge) {
    return (
      <aside className="rounded-[28px] border border-slate-200 bg-white/90 p-5 shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
        <SectionTitle title="Inspector" subtitle="Pick a node or connection on the canvas to edit or delete it." />
      </aside>
    );
  }

  if (selectedEdge) {
    return (
      <aside className="rounded-[28px] border border-slate-200 bg-white/90 p-5 shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
              <Settings2 className="h-3.5 w-3.5" />
              Connection
            </div>
            <h3 className="mt-4 text-xl font-semibold text-slate-950">Edge controls</h3>
          </div>
          <button
            type="button"
            onClick={onDelete}
            className="inline-flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700 transition hover:border-rose-300"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
        </div>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
          <div>
            <span className="font-semibold text-slate-900">From:</span> {selectedEdge.source}
          </div>
          <div className="mt-2">
            <span className="font-semibold text-slate-900">To:</span> {selectedEdge.target}
          </div>
          <div className="mt-4 text-slate-600">Click Delete to remove the line between these nodes.</div>
        </div>
      </aside>
    );
  }

  const activeNode = selectedNode!;

  return (
    <aside className="rounded-[28px] border border-slate-200 bg-white/90 p-5 shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
            <Settings2 className="h-3.5 w-3.5" />
            {activeNode.data.label}
          </div>
          <h3 className="mt-4 text-xl font-semibold text-slate-950">Node configuration</h3>
        </div>
        <button
          type="button"
          onClick={onDelete}
          className="inline-flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700 transition hover:border-rose-300"
        >
          <Trash2 className="h-4 w-4" />
          Delete
        </button>
      </div>

      <div className="mt-6 space-y-5">
        {activeNode.type === "start" ? (
          <>
            <SectionTitle title="Start Node" subtitle="Capture how the workflow begins and any metadata the engine should carry forward." />
            <Input
              value={(activeNode.data.config as WorkflowNodeConfigMap["start"]).title}
              onChange={(event) =>
                onUpdate((node) => ({
                  ...node,
                  data: {
                    ...node.data,
                    config: { ...(node.data.config as WorkflowNodeConfigMap["start"]), title: event.target.value }
                  }
                }))
              }
            />
            <KeyValueEditor
              rows={(activeNode.data.config as WorkflowNodeConfigMap["start"]).metadata}
              onChange={(rows) =>
                onUpdate((node) => ({
                  ...node,
                  data: {
                    ...node.data,
                    config: { ...(node.data.config as WorkflowNodeConfigMap["start"]), metadata: rows }
                  }
                }))
              }
            />
          </>
        ) : null}

        {activeNode.type === "task" ? (
          <>
            <SectionTitle title="Task Node" subtitle="Human tasks use a richer form with assignment, due date, and custom metadata." />
            <Input
              value={(activeNode.data.config as WorkflowNodeConfigMap["task"]).title}
              onChange={(event) =>
                onUpdate((node) => ({
                  ...node,
                  data: {
                    ...node.data,
                    config: { ...(node.data.config as WorkflowNodeConfigMap["task"]), title: event.target.value }
                  }
                }))
              }
            />
            <TextArea
              value={(activeNode.data.config as WorkflowNodeConfigMap["task"]).description}
              onChange={(event) =>
                onUpdate((node) => ({
                  ...node,
                  data: {
                    ...node.data,
                    config: { ...(node.data.config as WorkflowNodeConfigMap["task"]), description: event.target.value }
                  }
                }))
              }
              placeholder="Describe what the assignee needs to do."
            />
            <Input
              value={(activeNode.data.config as WorkflowNodeConfigMap["task"]).assignee}
              onChange={(event) =>
                onUpdate((node) => ({
                  ...node,
                  data: {
                    ...node.data,
                    config: { ...(node.data.config as WorkflowNodeConfigMap["task"]), assignee: event.target.value }
                  }
                }))
              }
              placeholder="Assignee"
            />
            <Input
              type="date"
              value={(activeNode.data.config as WorkflowNodeConfigMap["task"]).dueDate}
              onChange={(event) =>
                onUpdate((node) => ({
                  ...node,
                  data: {
                    ...node.data,
                    config: { ...(node.data.config as WorkflowNodeConfigMap["task"]), dueDate: event.target.value }
                  }
                }))
              }
            />
            <KeyValueEditor
              rows={(activeNode.data.config as WorkflowNodeConfigMap["task"]).customFields}
              onChange={(rows) =>
                onUpdate((node) => ({
                  ...node,
                  data: {
                    ...node.data,
                    config: { ...(node.data.config as WorkflowNodeConfigMap["task"]), customFields: rows }
                  }
                }))
              }
            />
          </>
        ) : null}

        {activeNode.type === "approval" ? (
          <>
            <SectionTitle title="Approval Node" subtitle="Keep approval behavior explicit so the flow remains readable and easy to extend." />
            <Input
              value={(activeNode.data.config as WorkflowNodeConfigMap["approval"]).title}
              onChange={(event) =>
                onUpdate((node) => ({
                  ...node,
                  data: {
                    ...node.data,
                    config: { ...(node.data.config as WorkflowNodeConfigMap["approval"]), title: event.target.value }
                  }
                }))
              }
            />
            <Input
              value={(activeNode.data.config as WorkflowNodeConfigMap["approval"]).approverRole}
              onChange={(event) =>
                onUpdate((node) => ({
                  ...node,
                  data: {
                    ...node.data,
                    config: { ...(node.data.config as WorkflowNodeConfigMap["approval"]), approverRole: event.target.value }
                  }
                }))
              }
              placeholder="Approver role"
            />
            <Input
              type="number"
              value={(activeNode.data.config as WorkflowNodeConfigMap["approval"]).autoApproveThreshold}
              onChange={(event) =>
                onUpdate((node) => ({
                  ...node,
                  data: {
                    ...node.data,
                    config: {
                      ...(node.data.config as WorkflowNodeConfigMap["approval"]),
                      autoApproveThreshold: Number(event.target.value) || 0
                    }
                  }
                }))
              }
              placeholder="Auto-approve threshold"
            />
          </>
        ) : null}

        {activeNode.type === "automation" ? (
          <>
            <SectionTitle title="Automated Step" subtitle="The action list is fetched from the mock API, and the parameter form adapts to the chosen action." />
            <Input
              value={(activeNode.data.config as WorkflowNodeConfigMap["automation"]).title}
              onChange={(event) =>
                onUpdate((node) => ({
                  ...node,
                  data: {
                    ...node.data,
                    config: { ...(node.data.config as WorkflowNodeConfigMap["automation"]), title: event.target.value }
                  }
                }))
              }
            />
            <select
              value={(activeNode.data.config as WorkflowNodeConfigMap["automation"]).actionId}
              onChange={(event) => {
                const action = automations.find((entry) => entry.id === event.target.value);
                onUpdate((node) => ({
                  ...node,
                  data: {
                    ...node.data,
                    config: {
                      ...(node.data.config as WorkflowNodeConfigMap["automation"]),
                      actionId: action?.id ?? "",
                      actionLabel: action?.label ?? "",
                      actionParams: Object.fromEntries((action?.params ?? []).map((param) => [param, ""]))
                    }
                  }
                }));
              }}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
            >
              <option value="">Select mock action</option>
              {automations.map((action) => (
                <option key={action.id} value={action.id}>
                  {action.label}
                </option>
              ))}
            </select>

            {(() => {
              const config = activeNode.data.config as WorkflowNodeConfigMap["automation"];
              const action = automations.find((entry) => entry.id === config.actionId);
              if (!action) {
                return null;
              }

              return (
                <div className="space-y-3">
                  {action.params.map((param) => (
                    <Input
                      key={param}
                      value={config.actionParams[param] ?? ""}
                      placeholder={param}
                      onChange={(event) =>
                        onUpdate((node) => ({
                          ...node,
                          data: {
                            ...node.data,
                            config: {
                              ...(node.data.config as WorkflowNodeConfigMap["automation"]),
                              actionParams: {
                                ...(node.data.config as WorkflowNodeConfigMap["automation"]).actionParams,
                                [param]: event.target.value
                              }
                            }
                          }
                        }))
                      }
                    />
                  ))}
                </div>
              );
            })()}
          </>
        ) : null}

        {activeNode.type === "end" ? (
          <>
            <SectionTitle title="End Node" subtitle="Describe the completion state and whether the workflow should produce a summary." />
            <TextArea
              value={(activeNode.data.config as WorkflowNodeConfigMap["end"]).message}
              onChange={(event) =>
                onUpdate((node) => ({
                  ...node,
                  data: {
                    ...node.data,
                    config: { ...(node.data.config as WorkflowNodeConfigMap["end"]), message: event.target.value }
                  }
                }))
              }
              placeholder="Completion message"
            />
            <label className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
              Summary flag
              <input
                type="checkbox"
                checked={(activeNode.data.config as WorkflowNodeConfigMap["end"]).summaryRequired}
                onChange={(event) =>
                  onUpdate((node) => ({
                    ...node,
                    data: {
                      ...node.data,
                      config: { ...(node.data.config as WorkflowNodeConfigMap["end"]), summaryRequired: event.target.checked }
                    }
                  }))
                }
                className="h-4 w-4 accent-slate-900"
              />
            </label>
          </>
        ) : null}
      </div>
    </aside>
  );
}
