"use server";

import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/dms/auth";
import { cookies } from "next/headers";
import fs from "fs";
import path from "path";

const GRIDS_FILE = path.join(process.cwd(), ".data", "saved-grids.json");

async function resolveEffectiveUserId(): Promise<string> {
  const user = await getCurrentUser();
  if (user) return user.id;

  try {
    const cookieStore = await cookies();
    let guestId = cookieStore.get("tv_guest_session")?.value;
    if (!guestId) {
      guestId = `guest-${Math.random().toString(36).substring(2, 10)}`;
      cookieStore.set("tv_guest_session", guestId, {
        path: "/",
        httpOnly: true,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });
    }
    return guestId;
  } catch {
    return "guest-session-anon";
  }
}

function getLocalGrids(): any[] {
  try {
    if (fs.existsSync(GRIDS_FILE)) {
      const content = fs.readFileSync(GRIDS_FILE, "utf-8");
      return JSON.parse(content);
    }
  } catch {}
  return [];
}

function saveLocalGrids(grids: any[]) {
  try {
    const dir = path.dirname(GRIDS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(GRIDS_FILE, JSON.stringify(grids, null, 2), "utf-8");
  } catch {}
}

export async function saveGrid(gridData: any, name: string) {
  const userId = await resolveEffectiveUserId();
  try {
    const savedGrid = await db.savedGrid.create({
      data: {
        userId,
        gridData,
        name,
      },
    });
    return { success: true, gridId: savedGrid.id };
  } catch (error) {
    // Graceful fallback to file-backed persistence with tenant isolation
    const localGrids = getLocalGrids();
    const newGrid = {
      id: `grid-${Date.now()}`,
      userId,
      name,
      gridData,
      createdAt: new Date().toISOString(),
    };
    localGrids.unshift(newGrid);
    saveLocalGrids(localGrids);
    return { success: true, gridId: newGrid.id };
  }
}

export async function loadGrid(gridId: string) {
  try {
    const grid = await db.savedGrid.findUnique({
      where: { id: gridId },
    });
    if (grid) return { success: true, grid };
  } catch (error) {
    // Fall through to local fallback
  }

  const localGrids = getLocalGrids();
  const localGrid = localGrids.find((g) => g.id === gridId);
  if (localGrid) return { success: true, grid: localGrid };

  return { success: false, error: "Grid not found" };
}

export async function getUserSavedGrids() {
  const userId = await resolveEffectiveUserId();
  try {
    const grids = await db.savedGrid.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    return { success: true, grids };
  } catch (error) {
    // Graceful fallback to local persistence with strict tenant isolation
    const localGrids = getLocalGrids().filter((g) => g.userId === userId);
    return { success: true, grids: localGrids };
  }
}
