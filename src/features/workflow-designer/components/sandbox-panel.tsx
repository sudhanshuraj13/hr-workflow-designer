"use client";

import { useState } from "react";
import { FlaskConical, Upload, Download, AlertTriangle, CheckCircle2 } from "lucide-react";

import type { SimulationResponse, WorkflowSnapshot, WorkflowValidationIssue } from "@/features/workflow-designer/types";

type SandboxPanelProps = {
  snapshot: WorkflowSnapshot;
  issues: WorkflowValidationIssue[];
  onImport: (snapshot: WorkflowSnapshot) => void;
};

export function SandboxPanel({ snapshot, issues, onImport }: SandboxPanelProps) {
  const [result, setResult] = useState<SimulationResponse | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  async function runSimulation() {
    setIsRunning(true);
    setImportError(null);

    try {
      const response = await fetch("/api/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(snapshot)
      });
      const data = (await response.json()) as SimulationResponse;
      setResult(data);
    } finally {
      setIsRunning(false);
    }
  }

  async function handleImport(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as WorkflowSnapshot;
      onImport(parsed);
      setImportError(null);
    } catch {
      setImportError("Import failed. Please provide a valid workflow JSON file.");
    }
  }

  const snapshotJson = JSON.stringify(snapshot, null, 2);

  return (
    <section className="rounded-[28px] border border-slate-200 bg-white/90 p-5 shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white">
            <FlaskConical className="h-3.5 w-3.5" />
            Workflow sandbox
          </div>
          <h3 className="mt-4 text-2xl font-semibold text-slate-950">Serialize, validate, simulate</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            This panel exercises the graph end to end by sending the current workflow to the mock simulation API.
          </p>
        </div>
        <div className="flex gap-2">
          <a
            href={`data:application/json;charset=utf-8,${encodeURIComponent(snapshotJson)}`}
            download="workflow.json"
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-900 hover:text-slate-950"
          >
            <Download className="h-4 w-4" />
            Export JSON
          </a>
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-900 hover:text-slate-950">
            <Upload className="h-4 w-4" />
            Import JSON
            <input type="file" accept=".json" className="hidden" onChange={handleImport} />
          </label>
        </div>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center justify-between gap-2">
            <div className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Live validation</div>
            <div className="text-sm text-slate-600">{issues.length} issue(s)</div>
          </div>
          <div className="mt-4 space-y-3">
            {issues.length === 0 ? (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                The workflow passes the client-side validation checks.
              </div>
            ) : (
              issues.map((issue) => (
                <div
                  key={issue.id}
                  className={`rounded-2xl border px-4 py-3 text-sm ${
                    issue.severity === "error"
                      ? "border-rose-200 bg-rose-50 text-rose-700"
                      : "border-amber-200 bg-amber-50 text-amber-700"
                  }`}
                >
                  {issue.message}
                </div>
              ))
            )}
          </div>
          {importError ? <div className="mt-4 text-sm text-rose-700">{importError}</div> : null}
          <button
            type="button"
            onClick={() => void runSimulation()}
            className="mt-5 w-full rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-70"
            disabled={isRunning}
          >
            {isRunning ? "Running simulation..." : "Run mock simulation"}
          </button>
        </div>

        <div className="rounded-[24px] border border-slate-200 bg-white p-4">
          <div className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Execution log</div>
          <div className="mt-4 space-y-3">
            {!result ? (
              <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-8 text-sm text-slate-500">
                Run the sandbox to see the step-by-step execution timeline.
              </div>
            ) : result.logs.length === 0 ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-rose-700">
                Simulation could not run because the workflow is invalid.
              </div>
            ) : (
              result.logs.map((entry) => (
                <div key={entry.id} className="rounded-2xl border border-slate-200 px-4 py-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-semibold text-slate-900">{entry.title}</div>
                    <div className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
                      entry.status === "success"
                        ? "bg-emerald-50 text-emerald-700"
                        : entry.status === "waiting"
                          ? "bg-amber-50 text-amber-700"
                          : "bg-slate-100 text-slate-700"
                    }`}>
                      {entry.status === "success" ? (
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      ) : (
                        <AlertTriangle className="h-3.5 w-3.5" />
                      )}
                      {entry.status}
                    </div>
                  </div>
                  <div className="mt-2 text-sm leading-6 text-slate-600">{entry.detail}</div>
                </div>
              ))
            )}
          </div>
          {result?.issues.length ? (
            <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
              Server-side validation also flagged {result.issues.length} issue(s). The execution log still helps inspect how far the graph gets.
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
