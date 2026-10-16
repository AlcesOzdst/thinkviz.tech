# ThinkViz: Intelligent AI Visualization and Enterprise Data Management System

ThinkViz is an educational artificial intelligence platform designed for universities, research laboratories, and engineering students. The platform pairs interactive, step-by-step algorithm visualizers with an enterprise Data Center for managing benchmark datasets, coursework documents, collaborative Kanban projects, and source-attributed AI synthesis.

---

## Release Architecture

ThinkViz is organized into two major production releases:

### Release 1 (v1.0): Interactive Algorithm Visualization Engine
The foundational release focuses on real-time, deterministic visualizers for artificial intelligence curricula. Students and researchers can trace search trees, evaluate heuristic state spaces, and observe execution telemetries step-by-step without requiring authentication.

- **Uninformed Search:** Breadth-First Search (BFS), Depth-First Search (DFS), and Uniform Cost Search (UCS).
- **Informed Search:** A* Search Algorithm and Greedy Best-First Search with Manhattan and Euclidean heuristics.
- **Local Search and Optimization:** Hill Climbing and Genetic Algorithm for the Traveling Salesperson Problem (TSP) with multi-representation fitness landscapes.
- **Adversarial Search:** Minimax Algorithm and Alpha-Beta Pruning for two-player zero-sum game trees.
- **Rule-Based Expert Systems:** Forward Chaining (data-driven modus ponens) and Backward Chaining (goal-driven hypothesis proving).

### Release 2 (v2.0): Enterprise Data Center and Governance
The second release expands ThinkViz into an institutional Data Center (`/data-center`) that unifies academic file management, structured dataset benchmarking, research milestone coordination, and contextual AI synthesis with 4-tier Role-Based Access Control (RBAC).

- **Educational Documents (`/data-center/files`):** Version-controlled storage for lecture slides, syllabi, problem sets, and algorithm proofs with in-browser previews.
- **Benchmark Datasets (`/data-center/datasets`):** Tabular CSV and JSON repository featuring automatic schema inference, data quality scoring, duplicate and null detection, and client export.
- **Projects and Kanban (`/data-center/projects`):** Research project management with a 3-column Kanban workflow board (To Do, In Progress, Done) for tracking student problem sets.
- **AI Synthesis Workspace (`/data-center/ai-workspace`):** Grounded document analysis powered by Google Gemini with strict provenance citations and confidence indicators.
- **Activity and Compliance Ledger (`/data-center/activity`):** Chronological audit stream recording user operations and security events.
- **Storage and Operational Analytics (`/data-center/analytics`):** Real-time monitoring of disk allocations, MIME breakdowns, and data health scores.
- **Administrative Governance (`/data-center/admin`):** Role administration, user management, and quota enforcement.

---

## Cybersecurity and Credential Protection

ThinkViz implements strict enterprise-grade security protocols across all client and server boundaries:

1. **Zero Credential Hardcoding:** Source code and client JavaScript bundles never contain plaintext passwords or secrets.
2. **Environment-Driven Authentication:** All role passwords and secret tokens are provisioned strictly via protected server environment variables (`.env`).
3. **Role-Based Access Control (RBAC):** Privileged endpoints require authentication under one of four roles:
   - `ADMIN`: Global system governance, role reassignment, and audit access.
   - `EDUCATOR`: Curriculum publishing, benchmark curation, and student project management.
   - `STUDENT`: Coursework access, benchmark testing, and task tracking.
   - `RESEARCHER`: Optimization datasets, large matrices, and research synthesis.
4. **Session Security:** Authenticated user sessions are stored in HTTP-only, SameSite cookies with production SSL flags enabled.
5. **Path Traversal Protection:** File storage paths are normalized and validated to prevent directory escape attacks.
6. **MIME and Upload Validation:** Uploads are restricted to approved document types with strict size quotas.
7. **Immutable Audit Trails:** Administrative updates and role elevations generate immutable audit entries for institutional compliance.

---

## Technology Stack

| Layer | Technology | Version | Purpose |
| :--- | :--- | :--- | :--- |
| Framework | Next.js (App Router, Turbopack) | 16.3.1 | Core application architecture |
| Frontend | React | 19.2.8 | User interface components |
| Styling | Tailwind CSS | 4.0 | Responsive design system |
| Database ORM | Prisma ORM | 7.9.1 | Database schema and query client |
| Primary Database | PostgreSQL | 15+ | Relational persistence |
| Fallback Storage | Atomic Local Repository | Dual-layer | Offline data resiliency |
| AI Integration | Google Gemini | 2.5 Pro | Grounded document synthesis |
| Programming Language | TypeScript | 5.0+ | End-to-end type safety |

---

## REST API Reference

The platform includes 22 authenticated REST API endpoints located at `/api/dms/*`:

| Endpoint | Method | Function |
| :--- | :--- | :--- |
| `/api/dms/files` | GET, POST | List files with category filters or upload new document |
| `/api/dms/files/[id]` | GET, PATCH, DELETE | Inspect metadata, modify filename, or soft-delete |
| `/api/dms/files/[id]/download` | GET | Stream binary file content with safe disposition |
| `/api/dms/files/[id]/restore` | POST | Restore soft-deleted document |
| `/api/dms/files/[id]/versions` | GET, POST | Retrieve revision history or upload new version |
| `/api/dms/collections` | GET, POST | List or create document collections |
| `/api/dms/collections/[id]` | DELETE | Remove collection and unlink associated documents |
| `/api/dms/datasets` | GET, POST | List datasets or import structured CSV/JSON file |
| `/api/dms/datasets/[id]` | GET, DELETE | Fetch paginated records or remove dataset |
| `/api/dms/datasets/[id]/records` | GET, POST | Query records or append row item |
| `/api/dms/datasets/[id]/records/[recordId]` | DELETE | Remove specific record entry |
| `/api/dms/datasets/[id]/export` | GET | Download dataset in clean CSV or JSON format |
| `/api/dms/projects` | GET, POST | List or initialize research projects |
| `/api/dms/projects/[id]` | GET, PATCH, DELETE | Update project parameters or remove project |
| `/api/dms/tasks` | GET, POST | Fetch or create Kanban tasks |
| `/api/dms/tasks/[id]` | PATCH, DELETE | Transition task column state or delete task |
| `/api/dms/ai/artifacts` | GET, POST | Fetch artifacts or generate Gemini synthesis |
| `/api/dms/ai/artifacts/[id]` | DELETE | Remove generated AI artifact |
| `/api/dms/activity` | GET | Fetch chronological audit ledger |
| `/api/dms/analytics` | GET | Retrieve storage utilization and health metrics |
| `/api/dms/admin/users` | GET | Enumerate platform users and role designations |
| `/api/dms/admin/users/[id]/role` | PATCH | Update user RBAC permissions |
| `/api/dms/admin/health` | GET | System diagnostics and storage integrity checks |

All endpoints are validated through an automated integration test runner with a 100% pass rate.

---

## Getting Started

### Prerequisites

- Node.js 20.x or higher
- npm 10.x or higher
- PostgreSQL (optional for local testing; atomic local persistence runs automatically)

### 1. Clone the Repository

```bash
git clone https://github.com/AlcesOzdst/thinkviz.tech.git
cd thinkviz.tech
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Copy the provided example environment template:

```bash
cp .env.example .env.local
```

Populate the required credentials in `.env.local`:

```env
DATABASE_URL="prisma+postgres://localhost:51213/?api_key=your_key"
AUTH_SECRET="your-secure-random-session-secret"
INTERNAL_API_SECRET="your-internal-test-key"

ADMIN_PASSWORD="your_admin_password"
EDUCATOR_PASSWORD="your_educator_password"
STUDENT_PASSWORD="your_student_password"
RESEARCHER_PASSWORD="your_researcher_password"
```

### 4. Database Setup

```bash
npx prisma generate
```

### 5. Start the Development Server

```bash
npm run dev
```

Open `http://localhost:3000` in your browser.

- Visit `http://localhost:3000/algorithms` to explore Release 1.0 visualizers.
- Visit `http://localhost:3000/data-center` to explore Release 2.0 Data Center.
- Visit `http://localhost:3000/login` to sign in.

### 6. Run Automated Security and API Tests

Verify system health, role-based access control, and endpoint compliance:

```bash
node .data/test-dms-api.mjs
```

---

## Authors and Leadership

- **Parth Doshi**, Lead Architect and Full-Stack Engineer (`parthdoshi404@gmail.com`)
- **Shaunak Apte**, Co-Author and Contributor
- **Arya Inamdar**, Engineering Contributor
- **Param Gadiya**, Engineering Contributor

MIT World Peace University

---

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.
