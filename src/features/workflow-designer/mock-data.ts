import type { AutomationDefinition } from "@/features/workflow-designer/types";

export const automationDefinitions: AutomationDefinition[] = [
  {
    id: "send_email",
    label: "Send Email",
    params: ["to", "subject"]
  },
  {
    id: "generate_doc",
    label: "Generate Document",
    params: ["template", "recipient"]
  },
  {
    id: "create_hr_ticket",
    label: "Create HR Ticket",
    params: ["queue", "priority"]
  }
];
