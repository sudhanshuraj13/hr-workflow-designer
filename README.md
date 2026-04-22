# HR Workflow Designer

A focused prototype for the Tredence Full Stack Engineering Intern case study. The app lets an HR admin visually build internal workflows, configure each node through type-specific forms, fetch mock automation actions, and run the current graph through a lightweight simulation sandbox.

## What is included

- React Flow canvas with drag-and-drop node creation
- Five custom node types: Start, Task, Approval, Automated Step, and End
- Node inspector with dedicated configuration forms for every node type
- Mock API layer:
  - `GET /api/automations`
  - `POST /api/simulate`
- Client-side validation for missing links, invalid Start/End placement, and cycles
- Sandbox panel with serialized graph preview, import/export JSON, and execution logs
- A starter onboarding workflow so the reviewer can test the app immediately

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

## Design notes

### 1. Feature-first structure

The workflow builder is grouped under `src/features/workflow-designer` so canvas behavior, node rendering, form handling, validation, and mock API concerns stay close together. This keeps the module easy to extend without spreading logic across unrelated folders.

### 2. Node modeling

Each workflow node uses a strongly typed `config` object keyed by node type. That makes the inspector forms predictable and avoids loosely shaped state when new node types are added later.

### 3. Validation and simulation

Validation runs on the client to give immediate feedback and is repeated in `POST /api/simulate` so the sandbox reflects server-side behavior too. The simulation layer walks the graph from the Start node and produces a readable step log rather than trying to fake a full backend.

### 4. Product choices

The prototype starts with a realistic onboarding flow so the reviewer sees a complete workflow on first load. I also added JSON import/export, minimap, and reset support because those features make the module easier to demonstrate in a short review session.

## Assumptions

- Only a lightweight prototype was required, so there is no persistence or authentication.
- Workflows are treated as directed acyclic graphs for the sandbox experience.
- Simulation is intentionally deterministic and text-based because the case study emphasizes architecture and reasoning over backend complexity.

## What I would add next

- Persist workflows to a backend or local storage
- Inline node-level validation badges with richer severity states
- Undo/redo history
- Branch conditions for approval outcomes
- Playwright coverage for graph editing and sandbox execution
