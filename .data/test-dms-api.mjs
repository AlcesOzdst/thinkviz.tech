// Comprehensive automated tester for ThinkViz Data Management System APIs
import http from "http";

const BASE_URL = "http://localhost:3000";

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const method = options.method || "GET";
  const headers = options.headers || {};
  let body = options.body;

  if (options.auth !== false && !headers["Cookie"] && !headers["x-user-id"]) {
    headers["Cookie"] = "dms_active_user=user-admin-1";
  }

  if (body && typeof body === "object" && !(body instanceof Buffer)) {
    body = JSON.stringify(body);
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(url, {
    method,
    headers,
    body,
  });

  const contentType = res.headers.get("content-type") || "";
  let data;
  if (contentType.includes("application/json")) {
    data = await res.json();
  } else {
    data = await res.text();
  }

  return { status: res.status, headers: res.headers, data };
}

async function runTests() {
  console.log("=================================================");
  console.log("THINKVIZ DMS AUTOMATED TEST SUITE");
  console.log("=================================================\n");

  const results = [];

  async function test(name, fn) {
    process.stdout.write(`Testing: ${name}... `);
    try {
      await fn();
      console.log("✅ PASSED");
      results.push({ name, passed: true });
    } catch (err) {
      console.log(`❌ FAILED: ${err.message}`);
      results.push({ name, passed: false, error: err.message });
    }
  }

  // 1. Analytics
  await test("GET /api/dms/analytics", async () => {
    const res = await request("/api/dms/analytics");
    if (res.status !== 200 || !res.data.success) throw new Error(`Status ${res.status}`);
    if (typeof res.data.analytics.storage.usedBytes !== "number") throw new Error("Invalid analytics shape");
  });

  // 2. Activity History
  await test("GET /api/dms/activity", async () => {
    const res = await request("/api/dms/activity?limit=10");
    if (res.status !== 200 || !res.data.success) throw new Error(`Status ${res.status}`);
    if (!Array.isArray(res.data.activities)) throw new Error("Activities is not an array");
  });

  // 3. Files List & Details
  let firstFileId = null;
  await test("GET /api/dms/files", async () => {
    const res = await request("/api/dms/files");
    if (res.status !== 200 || !res.data.success) throw new Error(`Status ${res.status}`);
    if (!Array.isArray(res.data.files) || res.data.files.length === 0) throw new Error("Files array empty");
    firstFileId = res.data.files[0].id;
  });

  await test("GET /api/dms/files/[id]", async () => {
    if (!firstFileId) throw new Error("No file to test");
    const res = await request(`/api/dms/files/${firstFileId}`);
    if (res.status !== 200 || !res.data.success) throw new Error(`Status ${res.status}`);
    if (!res.data.file || !res.data.preview) throw new Error("Missing file or preview in response");
  });

  // 4. File Versions
  await test("GET /api/dms/files/[id]/versions", async () => {
    const res = await request(`/api/dms/files/${firstFileId}/versions`);
    if (res.status !== 200 || !res.data.success) throw new Error(`Status ${res.status}`);
  });

  // 5. File Download
  await test("GET /api/dms/files/[id]/download", async () => {
    const res = await request(`/api/dms/files/${firstFileId}/download`);
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    const disposition = res.headers.get("content-disposition");
    if (!disposition || !disposition.includes("attachment")) throw new Error("Missing attachment header");
  });

  // 6. Collections
  let createdColId = null;
  await test("POST /api/dms/collections (Create Collection)", async () => {
    const res = await request("/api/dms/collections", {
      method: "POST",
      body: { name: "Automated Test Folder", description: "Created by tester", color: "#10B981" },
    });
    if (res.status !== 201 || !res.data.success) throw new Error(`Status ${res.status}: ${JSON.stringify(res.data)}`);
    createdColId = res.data.collection.id;
  });

  await test("GET /api/dms/collections", async () => {
    const res = await request("/api/dms/collections");
    if (res.status !== 200 || !res.data.success) throw new Error(`Status ${res.status}`);
    if (!res.data.collections.some((c) => c.id === createdColId)) throw new Error("Created collection not found in list");
  });

  await test("DELETE /api/dms/collections/[id]", async () => {
    if (!createdColId) throw new Error("No collection to delete");
    const res = await request(`/api/dms/collections/${createdColId}`, { method: "DELETE" });
    if (res.status !== 200 || !res.data.success) throw new Error(`Status ${res.status}`);
  });

  // 7. Datasets (Import & Record Ingestion)
  let createdDsId = null;
  await test("POST /api/dms/datasets (Import CSV Dataset)", async () => {
    const csvData = "iteration,heuristic_cost,explored_nodes,branching_factor\n1,14.5,12,2.4\n2,11.2,28,2.6\n3,8.0,45,2.7";
    const res = await request("/api/dms/datasets", {
      method: "POST",
      body: {
        name: "A* Heuristic Exploration Benchmark",
        description: "Automated benchmark import test",
        category: "Algorithm Metrics",
        format: "CSV",
        rawContent: csvData,
      },
    });
    if (res.status !== 201 || !res.data.success) throw new Error(`Status ${res.status}: ${JSON.stringify(res.data)}`);
    createdDsId = res.data.dataset.id;
    if (res.data.dataset.rowCount !== 3) throw new Error("Row count mismatch");
    if (res.data.dataQuality.score < 90) throw new Error("Quality score unexpected");
  });

  await test("GET /api/dms/datasets/[id] (Paginated records)", async () => {
    if (!createdDsId) throw new Error("No dataset to inspect");
    const res = await request(`/api/dms/datasets/${createdDsId}?limit=2&offset=0`);
    if (res.status !== 200 || !res.data.success) throw new Error(`Status ${res.status}`);
    if (res.data.records.length !== 2) throw new Error("Pagination limit failed");
    if (res.data.total !== 3) throw new Error("Total count mismatch");
  });

  await test("GET /api/dms/datasets/[id]/export (Export CSV)", async () => {
    if (!createdDsId) throw new Error("No dataset to export");
    const res = await request(`/api/dms/datasets/${createdDsId}/export?format=csv`);
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    if (!res.data.includes("iteration,heuristic_cost")) throw new Error("CSV content malformed");
  });

  let createdRecordId = null;
  await test("POST /api/dms/datasets/[id]/records (Add Row via API)", async () => {
    if (!createdDsId) throw new Error("No dataset to add record to");
    const res = await request(`/api/dms/datasets/${createdDsId}/records`, {
      method: "POST",
      body: {
        data: {
          iteration: 4,
          heuristic_cost: 6.5,
          explored_nodes: 58,
          branching_factor: 2.8,
        },
      },
    });
    if (res.status !== 201 || !res.data.success) throw new Error(`Status ${res.status}`);
    createdRecordId = res.data.record.id;
    if (res.data.record.rowIndex !== 3) throw new Error("Row index mismatch");
  });

  await test("DELETE /api/dms/datasets/[id]/records/[recordId] (Delete Row via API)", async () => {
    if (!createdDsId || !createdRecordId) throw new Error("No record to delete");
    const res = await request(`/api/dms/datasets/${createdDsId}/records/${createdRecordId}`, {
      method: "DELETE",
    });
    if (res.status !== 200 || !res.data.success) throw new Error(`Status ${res.status}`);
  });


  // 8. Projects & Tasks
  let createdProjId = null;
  await test("POST /api/dms/projects (Create Project)", async () => {
    const res = await request("/api/dms/projects", {
      method: "POST",
      body: { name: "Automated Research Sprint", description: "Benchmarking new heuristic algorithms" },
    });
    if (res.status !== 201 || !res.data.success) throw new Error(`Status ${res.status}`);
    createdProjId = res.data.project.id;
  });

  let createdTaskId = null;
  await test("POST /api/dms/tasks (Create Task)", async () => {
    if (!createdProjId) throw new Error("No project for task");
    const res = await request("/api/dms/tasks", {
      method: "POST",
      body: {
        title: "Verify Manhattan Distance Admissibility",
        projectId: createdProjId,
        priority: "HIGH",
        assigneeName: "Parth Doshi",
      },
    });
    if (res.status !== 201 || !res.data.success) throw new Error(`Status ${res.status}`);
    createdTaskId = res.data.task.id;
  });

  await test("PATCH /api/dms/tasks/[id] (Move Task Status)", async () => {
    if (!createdTaskId) throw new Error("No task to update");
    const res = await request(`/api/dms/tasks/${createdTaskId}`, {
      method: "PATCH",
      body: { status: "IN_PROGRESS" },
    });
    if (res.status !== 200 || !res.data.success) throw new Error(`Status ${res.status}`);
    if (res.data.task.status !== "IN_PROGRESS") throw new Error("Status was not updated");
  });

  // 9. AI Workspace
  let createdArtId = null;
  await test("POST /api/dms/ai/artifacts (Run AI Analysis)", async () => {
    const res = await request("/api/dms/ai/artifacts", {
      method: "POST",
      body: {
        sourceType: "FILE",
        sourceId: firstFileId,
        prompt: "Synthesize computational complexity bounds",
      },
    });
    if (res.status !== 201 || !res.data.success) throw new Error(`Status ${res.status}`);
    createdArtId = res.data.artifact.id;
    if (!res.data.artifact.sourceRefs || res.data.artifact.sourceRefs.length === 0) {
      throw new Error("Missing citation source references");
    }
  });

  await test("DELETE /api/dms/ai/artifacts/[id]", async () => {
    if (!createdArtId) throw new Error("No artifact to delete");
    const res = await request(`/api/dms/ai/artifacts/${createdArtId}`, { method: "DELETE" });
    if (res.status !== 200 || !res.data.success) throw new Error(`Status ${res.status}`);
  });

  // 10. Admin Endpoints
  await test("GET /api/dms/admin/users", async () => {
    const res = await request("/api/dms/admin/users");
    if (res.status !== 200 || !res.data.success) throw new Error(`Status ${res.status}`);
    if (!Array.isArray(res.data.users) || res.data.users.length === 0) throw new Error("Users array empty");
  });

  await test("PATCH /api/dms/admin/users/[id]/role", async () => {
    const res = await request("/api/dms/admin/users/user-student-1/role", {
      method: "PATCH",
      body: { role: "RESEARCHER" },
    });
    if (res.status !== 200 || !res.data.success) throw new Error(`Status ${res.status}`);
  });

  await test("GET /api/dms/admin/health", async () => {
    const res = await request("/api/dms/admin/health");
    if (res.status !== 200 || !res.data.success) throw new Error(`Status ${res.status}`);
    if (res.data.status !== "HEALTHY") throw new Error("Health status not healthy");
  });

  // 11. Strict RBAC Enforcement Gates
  await test("RBAC: Reject unauthenticated access to admin endpoints (401)", async () => {
    const res = await request("/api/dms/admin/users", { auth: false, headers: { Cookie: "" } });
    if (res.status !== 401) throw new Error(`Expected 401 Unauthorized, got ${res.status}`);
  });

  await test("RBAC: Block non-admin student access to admin endpoints (403)", async () => {
    const res = await request("/api/dms/admin/users", { headers: { Cookie: "dms_active_user=user-student-1" } });
    if (res.status !== 403) throw new Error(`Expected 403 Forbidden, got ${res.status}`);
  });

  await test("Security: Reject unauthenticated GET access to files (401)", async () => {
    const res = await request("/api/dms/files", { auth: false, headers: { Cookie: "" } });
    if (res.status !== 401) throw new Error(`Expected 401 Unauthorized, got ${res.status}`);
  });

  await test("Security: Reject unauthenticated GET access to activity logs (401)", async () => {
    const res = await request("/api/dms/activity", { auth: false, headers: { Cookie: "" } });
    if (res.status !== 401) throw new Error(`Expected 401 Unauthorized, got ${res.status}`);
  });

  await test("Security: Prevent header spoofing x-user-id bypass (401)", async () => {
    const res = await request("/api/dms/admin/users", { auth: false, headers: { Cookie: "", "x-user-id": "user-admin-1" } });
    if (res.status !== 401) throw new Error(`Expected 401 Unauthorized when spoofing x-user-id header, got ${res.status}`);
  });

  console.log("\n=================================================");
  console.log(`TOTAL TESTS: ${results.length}`);
  const passed = results.filter((r) => r.passed).length;
  console.log(`PASSED: ${passed}/${results.length}`);
  console.log(`FAILED: ${results.length - passed}/${results.length}`);
  console.log("=================================================");
}

runTests().catch(console.error);
