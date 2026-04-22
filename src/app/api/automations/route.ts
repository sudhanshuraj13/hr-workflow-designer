import { NextResponse } from "next/server";

import { automationDefinitions } from "@/features/workflow-designer/mock-data";

export async function GET() {
  return NextResponse.json({
    automations: automationDefinitions
  });
}
