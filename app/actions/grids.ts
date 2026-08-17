"use server"

import { db } from "@/lib/db"
import { auth } from "@/auth"

export async function saveGrid(gridData: any, name: string) {
  try {
    // Bypassed auth for local testing
    const userId = "local-guest-user-123";

    const savedGrid = await db.savedGrid.create({
      data: {
        userId,
        gridData,
        name
      }
    });

    return { success: true, gridId: savedGrid.id };
  } catch (error) {
    console.error("Failed to save grid:", error);
    return { success: false, error: "Failed to save grid" };
  }
}

export async function loadGrid(gridId: string) {
  try {
    const grid = await db.savedGrid.findUnique({
      where: { id: gridId }
    });
    if (!grid) return { success: false, error: "Grid not found" };
    return { success: true, grid };
  } catch (error) {
    console.error("Failed to load grid:", error);
    return { success: false, error: "Failed to load grid" };
  }
}

export async function getUserSavedGrids() {
  try {
    // Bypassed auth for local testing
    const userId = "local-guest-user-123";
    if (!userId) return { success: false, error: "Not authenticated" };

    const grids = await db.savedGrid.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    
    return { success: true, grids };
  } catch (error) {
    console.error("Failed to fetch user grids:", error);
    return { success: false, error: "Failed to fetch grids" };
  }
}
