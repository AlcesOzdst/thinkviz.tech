"use server"

import { db } from "@/lib/db"

export async function logTelemetryEvent({
  sessionId,
  algorithmId,
  action
}: {
  sessionId: string;
  algorithmId: string;
  action: string;
}) {
  try {
    await db.telemetryEvent.create({
      data: {
        sessionId,
        algorithmId,
        action
      }
    });
    return { success: true };
  } catch (error) {
    console.error("Failed to log telemetry:", error);
    return { success: false, error: "Failed to log telemetry" };
  }
}
