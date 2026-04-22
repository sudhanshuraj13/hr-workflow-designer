# HR Workflow Designer

This project is a small HR workflow builder built with Next.js and React Flow. It lets an HR admin place steps on a canvas, connect them, configure each step, and run the workflow through a mock simulation.

## Features

- React Flow canvas with drag-and-drop node creation
- Five custom node types: Start, Task, Approval, Automated Step, and End
- Node inspector with dedicated configuration forms for every node type
- Mock API layer:
  - `GET /api/automations`
  - `POST /api/simulate`
- Client-side validation for missing links, invalid Start/End placement, and cycles
- Sandbox panel with serialized graph preview, import/export JSON, and execution logs
- A starter onboarding workflow loaded by default

## Stack

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- `@xyflow/react`
- `lucide-react`

## Project structure

```text
src/
  app/
    api/
      automations/
      simulate/
  features/
    workflow-designer/
      components/
      mock-data.ts
      node-components.tsx
      types.ts
      use-workflow-designer.ts
      utils.ts
```

## How to run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Notes

### Structure

The workflow builder lives under `src/features/workflow-designer` so the canvas, node rendering, validation, and form logic stay in one place.

### Node data

Each node has a typed `config` object based on its node type. That keeps the inspector logic straightforward and makes it easier to add more node types later.

### Validation and simulation

Validation runs on the client for quick feedback and again inside `POST /api/simulate`. The simulator walks the graph from the Start node and returns a simple execution log.

### Scope

This is intentionally a lightweight prototype, so there is no auth or persistence yet. The focus here is the workflow editing experience, validation, and simulation flow.

## Next improvements

- Persist workflows to a backend or local storage
- Better inline validation on nodes and edges
- Undo/redo history
- Branch conditions for approval outcomes
- Playwright coverage for graph editing and sandbox execution
