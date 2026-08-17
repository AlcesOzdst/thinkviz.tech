"use server"

import { db } from "@/lib/db"

export async function markAlgorithmComplete(algorithmId: string, timeSpentSeconds: number) {
  try {
    // Bypassed auth for local testing
    const userId = "local-guest-user-123";

    const progress = await db.userProgress.upsert({
      where: {
        userId_algorithmId: {
          userId: userId,
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
        userId: userId,
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

export async function getUserProgress() {
  try {
    // Bypassed auth for local testing
    const userId = "local-guest-user-123";

    const progress = await db.userProgress.findMany({
      where: {
        userId: userId
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    return { success: true, progress };
  } catch (error) {
    console.error("Failed to fetch progress:", error);
    return { success: false, error: "Failed to fetch progress" };
  }
}
