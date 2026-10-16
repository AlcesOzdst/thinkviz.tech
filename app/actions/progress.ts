"use server";

import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/dms/auth";
import { cookies } from "next/headers";
import fs from "fs";
import path from "path";

const PROGRESS_FILE = path.join(process.cwd(), ".data", "user-progress.json");

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

function getLocalProgress(): any[] {
  try {
    if (fs.existsSync(PROGRESS_FILE)) {
      const content = fs.readFileSync(PROGRESS_FILE, "utf-8");
      return JSON.parse(content);
    }
  } catch {}
  return [];
}

function saveLocalProgress(progress: any[]) {
  try {
    const dir = path.dirname(PROGRESS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2), "utf-8");
  } catch {}
}

export async function markAlgorithmComplete(algorithmId: string, timeSpentSeconds: number) {
  const userId = await resolveEffectiveUserId();
  try {
    const progress = await db.userProgress.upsert({
      where: {
        userId_algorithmId: {
          userId,
          algorithmId,
        },
      },
      update: {
        completed: true,
        timeSpentSeconds: {
          increment: timeSpentSeconds,
        },
      },
      create: {
        userId,
        algorithmId,
        completed: true,
        timeSpentSeconds,
      },
    });
    return { success: true, progress };
  } catch (error) {
    // Graceful fallback to file-backed progress
    const list = getLocalProgress();
    const existing = list.find((p) => p.userId === userId && p.algorithmId === algorithmId);
    if (existing) {
      existing.completed = true;
      existing.timeSpentSeconds = (existing.timeSpentSeconds || 0) + timeSpentSeconds;
      existing.updatedAt = new Date().toISOString();
    } else {
      list.unshift({
        id: `prog-${Date.now()}`,
        userId,
        algorithmId,
        completed: true,
        timeSpentSeconds,
        updatedAt: new Date().toISOString(),
      });
    }
    saveLocalProgress(list);
    return { success: true, progress: existing || list[0] };
  }
}

export async function getUserProgress() {
  const userId = await resolveEffectiveUserId();
  try {
    const progress = await db.userProgress.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
    });
    return { success: true, progress };
  } catch (error) {
    // Graceful fallback to local persistence with strict tenant isolation
    const localProgress = getLocalProgress().filter((p) => p.userId === userId);
    return { success: true, progress: localProgress };
  }
}
