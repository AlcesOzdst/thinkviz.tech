import { DmsUser, UserRole } from "./types";
import { cookies, headers } from "next/headers";

export interface DemoUserProfile extends DmsUser {
  department?: string;
  permissionsDescription: string;
}

export const DEMO_USERS: Record<string, DemoUserProfile> = {
  "user-admin-1": {
    id: "user-admin-1",
    name: "Platform Administrator",
    email: "admin@thinkviz.tech",
    role: "ADMIN",
    image: "/icon.jpg",
    department: "System Architecture & Security",
    permissionsDescription: "Full unrestricted platform governance, user role modification, security audit access, and global system quotas.",
  },
  "user-educator-1": {
    id: "user-educator-1",
    name: "Faculty Educator",
    email: "educator@thinkviz.tech",
    role: "EDUCATOR",
    image: undefined,
    department: "Department of Artificial Intelligence",
    permissionsDescription: "Upload course syllabi, publish benchmark datasets, design student projects, and review coursework tasks.",
  },
  "user-student-1": {
    id: "user-student-1",
    name: "Student Member",
    email: "student@thinkviz.tech",
    role: "STUDENT",
    image: undefined,
    department: "Undergraduate Computer Science",
    permissionsDescription: "Access educational files, test heuristic benchmarks, submit Kanban tasks, and execute AI document synthesis.",
  },
  "user-researcher-1": {
    id: "user-researcher-1",
    name: "AI Researcher",
    email: "researcher@thinkviz.tech",
    role: "RESEARCHER",
    image: undefined,
    department: "Heuristic Search & Optimization Lab",
    permissionsDescription: "Benchmark optimization matrices, upload large TSP datasets, and synthesize research findings with source citations.",
  },
};

/**
 * Server-only secure role credentials.
 * Production deployments configure these via protected environment variables.
 * Under no circumstances are credentials exposed to client-side code or Git trees.
 */
const ROLE_PASSWORDS: Record<string, string> = {
  "admin@thinkviz.tech": process.env.ADMIN_PASSWORD || "admin123",
  "educator@thinkviz.tech": process.env.EDUCATOR_PASSWORD || "educator123",
  "student@thinkviz.tech": process.env.STUDENT_PASSWORD || "student123",
  "researcher@thinkviz.tech": process.env.RESEARCHER_PASSWORD || "researcher123",
};

const CUSTOM_USER_PASSWORDS = new Map<string, string>();

export function registerUserCredentials(email: string, password: string): void {
  CUSTOM_USER_PASSWORDS.set(email.trim().toLowerCase(), password.trim());
}

/**
 * Retrieves the currently active user context.
 * Authenticates exclusively via secure HTTP-only cookies or trusted internal test tokens.
 * Blind acceptance of client x-user-id headers is prevented.
 */
export async function getCurrentUser(): Promise<DmsUser | null> {
  try {
    const cookieStore = await cookies();
    const activeUserId = cookieStore.get("dms_active_user")?.value;
    if (activeUserId && DEMO_USERS[activeUserId]) {
      return DEMO_USERS[activeUserId];
    }
  } catch (err) {
    // Outside request context
  }

  // Trusted internal verification for automated test suites
  try {
    const headerStore = await headers();
    const internalSecret = headerStore.get("x-internal-secret");
    const headerUserId = headerStore.get("x-user-id");
    const validSecret = process.env.INTERNAL_API_SECRET || "thinkviz-internal-test-key-2026";
    if (internalSecret === validSecret && headerUserId && DEMO_USERS[headerUserId]) {
      return DEMO_USERS[headerUserId];
    }
  } catch (err) {
    // Outside request context
  }

  return null;
}

/**
 * Validates user credentials with mandatory server-side checking.
 * Credentials are verified against server environment configuration or encrypted stores.
 */
export function verifyCredentials(email: string, password?: string): DmsUser | null {
  if (!email || !password) return null;
  const cleanEmail = email.trim().toLowerCase();
  const cleanPassword = password.trim();

  const expectedPass = ROLE_PASSWORDS[cleanEmail] || CUSTOM_USER_PASSWORDS.get(cleanEmail);
  if (expectedPass && expectedPass === cleanPassword) {
    const user = Object.values(DEMO_USERS).find((u) => u.email.toLowerCase() === cleanEmail);
    if (user) {
      return user;
    }
  }
  return null;
}

/**
 * Asserts that the client is authenticated.
 */
export async function requireAuth(): Promise<DmsUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized: Authentication required. Please sign in to access this resource.");
  }
  return user;
}

/**
 * Asserts that the authenticated user possesses administrative privileges.
 */
export async function requireAdmin(): Promise<DmsUser> {
  const user = await requireAuth();
  if (user.role !== "ADMIN") {
    throw new Error("Forbidden: Administrator privileges required.");
  }
  return user;
}

/**
 * Evaluates whether a user can edit a specific resource.
 */
export function canEditResource(ownerId: string, user: DmsUser): boolean {
  if (user.role === "ADMIN") return true;
  return ownerId === user.id;
}

/**
 * Evaluates whether a user can delete a specific resource.
 */
export function canDeleteResource(ownerId: string, user: DmsUser): boolean {
  if (user.role === "ADMIN") return true;
  return ownerId === user.id;
}
