"use server"

import { db } from "@/lib/db"
import { auth } from "@/auth"

export async function markAlgorithmComplete(algorithmId: string, timeSpentSeconds: number) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    const progress = await db.userProgress.upsert({
      where: {
        userId_algorithmId: {
          userId: session.user.id,
          algorithmId
        }
      },
      update: {
        completed: true,
        timeSpentSeconds: {
          increment: timeSpentSeconds
        }
      },
      create: {
        userId: session.user.id,
        algorithmId,
        completed: true,
        timeSpentSeconds
      }
    });

    return { success: true, progress };
  } catch (error) {
    console.error("Failed to save progress:", error);
    return { success: false, error: "Failed to save progress" };
  }
}
