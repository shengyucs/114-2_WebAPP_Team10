# Software Requirement Specification (SRS)

## 1. Introduction

### 1.1 Purpose

This document defines the architecture, functional/non-functional requirements, and system interfaces for the "Dynamic Status Node Calculator". It serves as the core instruction manual for the development team and acts as the primary system context for AI agents (e.g., Claude, Antigravity) during full-stack code generation.

### 1.2 System Scope

The system is a Web-based thin-client application providing gamers and theorycrafters with a visual, drag-and-drop node interface. It is used to construct complex numerical formulas (e.g., damage/stat calculation) and simulate dynamic state changes (Buffs/Debuffs) over a timeline. The system supports account-less UGC sharing via short URLs and deep integration with Google Drive for persistent personal storage.

### 1.3 Glossary

- **DAG (Directed Acyclic Graph):** The core data structure for all numerical nodes and edges. Circular dependencies are strictly prohibited.
- **Multiplier Zone:** Independent blocks of calculation. Values within the same zone are combined using addition; values across different zones are combined using multiplication.
- **Operator Node:** A special node type that accepts two ordered inputs (A and B) and applies a user-selected arithmetic operation (+, −, ×, ÷) to produce a single output.

## 2. System Architecture

### 2.1 System Architecture Diagram

> This diagram illustrates the data flow and protocols between the frontend, backend compute server, database, and external cloud services.

```mermaid
flowchart TB
    User((User))
    GoogleDrive[("Google Drive\n(External Cloud)")]
    GoogleAuth["Google OAuth 2.0\n(Authentication)"]

    subgraph Frontend ["Frontend App (React SPA)"]
        UI[UI Rendering - React Flow]
        State[Global State - Zustand]
        WS_Client[WebSocket Client - Socket.io-client]
        Drive_Client[Google API Auth & Transfer Module]
    end

    subgraph Backend ["Backend Server (Node.js)"]
        WS_Server[WebSocket Server - Socket.io]
        REST_API[RESTful API Router - Express]
        Engine[DAG Topology & Calculation Engine]
    end

    subgraph Database ["Database Layer"]
        Mongo[(MongoDB)]
    end

    User -- "1. Drag nodes, configure graph" --> UI
    User -- "5. Login & Cloud access" --> Drive_Client

    UI <--> State
    State <--> WS_Client

    WS_Client -- "2a. emit('update_graph', Payload)" --> WS_Server
    WS_Server -- "2c. emit('calc_result', Payload)" --> WS_Client

    State -- "3a. POST /api/share" --> REST_API
    State -- "4a. GET /api/share/{id}" --> REST_API

    WS_Server -- "2b. Execute topology & calc" --> Engine
    Engine --> WS_Server

    REST_API -- "3b. Write JSON Graph" --> Mongo
    REST_API -- "4b. Read JSON Graph" --> Mongo

    Drive_Client -- "5a. Get Access Token" --> GoogleAuth
    Drive_Client -- "5b. Multipart Upload/Download .calc" --> GoogleDrive
```

### 2.2 Tech Stack Constraints

- **Frontend Framework:** React, TypeScript.
- **Backend Framework:** Node.js, Express, Socket.io.
- **Database:** MongoDB (NoSQL).

### 2.3 Local & Collaborative Development Environment Specifications

The project utilizes Docker and Docker Compose as the standard for local backend and database development.

#### 2.3.1 Multi-Architecture Support Requirements

- **Native Execution Principle:** Running x86 database images via the Rosetta 2 translation layer on Apple M-series chips (e.g., M4) is strictly prohibited.
- **Dependency Constraints:** Developers must select Docker images from Docker Hub that explicitly support both `linux/arm64` and `windows` architectures. The system must rely on the Docker Engine's auto-detection to pull the native version for the host machine.

#### 2.3.2 Containerization Configuration (Docker Compose)

A shared `docker-compose.yml` must be maintained at the project root following Infrastructure as Code (IaC) principles.

1. **Database Layer (MongoDB):**
   - **Image:** Use a stable dual-arch version (e.g., `mongo:7.0`). The `latest` tag is prohibited to prevent unexpected version behaviors.
   - **Data Persistence:** Must configure Docker Volumes (e.g., `/data/db`) to ensure test graphs and mock data are not lost upon container restart/destruction.
   - **Port Mapping:** Map host port `27017` to container port `27017`.
2. **Backend Layer (Node.js API & WebSocket):**
   - **Hot-Reloading:** The backend container must map the local source code directory via Volumes and launch via `nodemon` or `tsx watch`. This ensures instant server reloads on file save without rebuilding the container.
   - **Environment Variable Injection:** MongoDB Connection Strings and JWT Secrets must be injected via a `.env` file. The `.env` file must be gitignored and never committed.

#### 2.3.3 Frontend Development Strategy

- To maximize React/Vite Hot Module Replacement (HMR) performance and browser debugging capabilities, the frontend application is **not** strictly required to be containerized locally.
- Developers run the frontend natively via `npm run dev` (Node v20.x LTS recommended via NVM) and proxy API requests to the Dockerized backend (`localhost:3000`).

#### 2.3.4 Standard Operating Procedure (SOP)

Standard daily workflow after cloning the repository:

1. **Start Backend & DB:** Run `docker-compose up -d` at the project root.
2. **Start Frontend:** In a separate terminal, navigate to the `frontend` directory and run `npm run dev`.
3. **Shutdown & Cleanup:** Run `docker-compose down` to stop services (data retained). Run `docker-compose down -v` to completely wipe test data.

## 3. Use Case Analysis

> The Primary Actor for this system is the **User** (Gamer / Theorycrafter).

### 3.1 Use Case Diagram

```mermaid
flowchart LR
    User((User))
    SysEngine[[Backend Compute Engine]]
    GoogleAPI[[Google API Service]]

    subgraph System ["Web App"]
        direction TB
        UC1([1. Create & Connect Nodes])
        UC2([2. Configure Node Properties & Zones])
        UC4([4. View Calculation Results])
        UC5([5. Generate Short URL])
        UC6([6. Load Shared Template])
        UC7([7. Login & Authorize])
        UC8([8. Save Graph to Cloud])
        UC9([9. Load Graph from Cloud])
        UC10([10. Configure Operator Node])
    end

    User --- UC1 & UC2 & UC4 & UC5 & UC6 & UC7 & UC8 & UC9 & UC10
    UC8 -. "<<include>>" .-> UC7
    UC9 -. "<<include>>" .-> UC7
    UC10 -. "<<extend>>" .-> UC2
    UC1 --- SysEngine
    SysEngine --- UC4
    UC7 & UC8 & UC9 --- GoogleAPI
```

### 3.2 Use Case Specifications

#### UC0: Initialization of the Dashboard and Canvas Framework

The goal of this UC is to establish a "What You See Is What You Get" (WYSIWYG) base UI, giving your team a solid foundation where nodes and logic can be added later.

- **Main Flow:**
  1. Upon entering the web app, the system loads a full-screen React Flow canvas.
  2. The left side displays a **Toolbox**: Lists available node templates (Input Node, Buff Node, Output Node, Operator Node).
  3. The center area is the **Canvas**: Supports zooming, panning, and grid-snapping.
  4. The right side displays the **Inspector (Property Panel)**: Initially empty, but will expand/populate when a node is clicked.
- **Acceptance Criteria (AC):**
  - **AC1 - Canvas Completeness:** The user must see a functional canvas with a visible background grid.
  - **AC2 - Layout Consistency:** The Toolbox and Inspector must be fixed sidebars that do not move when the canvas is zoomed or panned.
  - **AC3 - Responsive Design:** The canvas must automatically fill the remaining screen space across different monitor sizes.

#### UC1: Create & Connect Numerical Nodes

- **Precondition:** Canvas is initialized.
- **Trigger:** User clicks a node template in the Toolbox.
- **Main Flow:**
  1. System renders a node of the selected type (Input, Buff, Output, or Operator) on the canvas.
  2. **Operator Node:** Renders with two distinct target handles on the left side — **A** (first operand) and **B** (second operand) — and one source handle on the right (result output).
  3. User drags from a source handle to a target handle to create a connection.
  4. Frontend immediately blocks any connection that would create a Circular Dependency.
  5. System syncs the topology changes to the backend via WebSocket.
- **Postcondition:** DAG structure is successfully updated.

#### UC2: Configure Node Properties & Multiplier Zones

- **Precondition:** Nodes exist on the canvas.
- **Trigger:** User clicks a node to open the Property Inspector.
- **Main Flow:**
  1. User inputs a numeric value and defines the node's attributes.
  2. **Domain Constraint:** Zones with different names are treated as strictly independent (no automatic merging). E.g., "Crit Rate" (15%) and "Final Crit Rate" (20%) are calculated as separate multiplied zones.
  3. **Strict Evaluation:** The system MUST NOT implicitly assume hidden base values. If no base probability is declared on the canvas, the system must not assume a default 50%. Calculations must strictly reflect the user's explicit node connections.
- **Postcondition:** Node properties updated, triggering calculation.

#### UC4: View Calculation Results

- **Precondition:** Backend compute engine finishes topological sorting and calculation.
- **Main Flow:**
  1. Backend emits `calc_result` event via WebSocket to the frontend.
  2. Frontend parses the payload and updates the numeric displays on Output Nodes.

#### UC5: Generate Shareable Short URL

- **Precondition:** User finished configuring the graph.
- **Main Flow:**
  1. User clicks "Share".
  2. Frontend serializes `GraphState` to JSON and sends a POST request to the REST API.
  3. Backend generates a unique UUID, storing the UUID and JSON in MongoDB.
  4. System returns a short URL (e.g., `https://domain.com/s/uuid`) and copies it to the clipboard.
- **Postcondition:** The current graph state is permanently saved as Immutable Data.

#### UC6: Load Community Shared Template (Fork Mechanism)

- **Precondition:** User opens a short URL containing a UUID.
- **Main Flow:**
  1. Frontend extracts the UUID parameter and sends a GET request to the REST API.
  2. Backend fetches the corresponding JSON graph from MongoDB.
  3. Zustand state manager injects the data, instantly rendering the React Flow canvas.
  4. If the user edits the canvas and shares again, UC5 repeats, generating a new UUID without modifying the original data.

#### UC7: Login & Authorization

- **Precondition:** User clicks any Google Drive integration button.
- **Main Flow:**
  1. System triggers Google Identity Services OAuth 2.0 popup.
  2. User logs in and grants scope: `https://www.googleapis.com/auth/drive.file`.
  3. System caches the Access Token in frontend memory.

#### UC8: Save Graph to Google Drive

- **Precondition:** Includes UC7 (Authorized).
- **Main Flow:**
  1. Frontend converts `GraphState` to a JSON file named `{filename}.calc`.
  2. Frontend issues a `multipart/form-data` POST request directly to the Google Drive REST API.
  3. File is saved inside the user's `appDataFolder` to avoid cluttering their visible Drive files.
  4. UI displays success toast.

#### UC9: Load Graph from Google Drive

- **Precondition:** Includes UC7 (Authorized).
- **Main Flow:**
  1. System calls Drive API to list all `.calc` files inside `appDataFolder`.
  2. UI renders a file picker list.
  3. Upon selection, system downloads the file, deserializes the JSON, and overwrites the canvas state.

#### UC10: Configure Operator Node

- **Precondition:** An Operator Node exists on the canvas and is selected.
- **Trigger:** User clicks an Operator Node on the canvas.
- **Main Flow:**
  1. Inspector Panel opens and displays an **Operation** section at the top.
  2. Four buttons are shown: `+` (Add), `−` (Subtract), `×` (Multiply), `÷` (Divide).
  3. The currently active operation is highlighted with a blue border.
  4. User clicks a button to select the desired operation.
  5. The node's canvas display immediately updates to show the new operation symbol.
- **Postcondition:** The Operator Node's `operator` property is updated; subsequent graph calculations use the new operation.
- **Special Constraint:** For non-commutative operations (subtraction, division), the operand order is fixed: handle **A** (top-left) is the first operand, handle **B** (bottom-left) is the second. The computation is always `A [op] B` (e.g., `A ÷ B`, not `B ÷ A`).

## 4. Detailed Functional Requirements

### 4.1 Algorithm & Topological Sorting

- **REQ-4.1.1 Topology Engine:** Upon receiving the DAG structure, the backend MUST execute Kahn's Algorithm or DFS topological sorting. Nodes with an in-degree of 0 must be calculated first. Downstream nodes are only evaluated after all dependencies provide their values.
- **REQ-4.1.2 Multiplier Zone Convergence Logic:**
  - If Node A and Node B connect to Node C, and A & B share the **same** multiplier zone: `C_input = Value_A + Value_B`.
  - If A & B have **different** multiplier zones: `C_input = Value_A * Value_B`.

### 4.2 Payload Specifications

> Frontend and backend MUST share exact TypeScript Interfaces. AI Agents must use the following core structures to generate strongly-typed code:

```typescript
// Shared Types Definition
export interface NodeData {
  id: string;
  type: 'input' | 'output' | 'buff' | 'operator';
  label?: string; // Optional display name
  multiplierZone: string; // Identifier for the calculation zone
  value: number; // Numeric stat value
  isPercentage: boolean; // True if value is a percentage
  startTime?: number; // Active start time for buffs
  endTime?: number; // Active end time for buffs
  operator?: '+' | '-' | '*' | '/'; // Only for operator nodes; default '+'
}

export interface EdgeData {
  source: string; // Source Node ID
  target: string; // Target Node ID
  sourceHandle?: string; // Handle ID on source node (e.g. 'a', 'b')
  targetHandle?: string; // Handle ID on target node
}

export interface GraphState {
  nodes: NodeData[];
  edges: EdgeData[];
}
```

## 5. External Interface Requirements

### 5.1 User Interface (UI)

- **Canvas:** Must support "Snap to grid", infinite zooming, and panning. Nodes must be draggable, connected via bezier curves.
- **Inspector Panel:** Clicking a node opens a dynamic right sidebar. For Operator Nodes, the panel shows an Operation selector (four buttons: +, −, ×, ÷) at the top. For all node types, it shows Identification (label), Value, and Position/Size fields. Buff nodes additionally show Start/End time fields.

### 5.2 System & Communication Interfaces

- **WebSocket Channel:**
  - Client Emits: `socket.emit('update_graph', { graph: GraphState, currentTime: number })`
  - Server Emits: `socket.on('calc_result', (results: Record<string, number>) => void)`
- **REST API Channel:**
  - **Share (POST):** Endpoint `/api/share`. Body: `GraphState` JSON. Returns HTTP 201 with `{"id": "uuid-string"}`.
  - **Load (GET):** Endpoint `/api/share/:id`. Returns HTTP 200 with the full `GraphState` JSON.

## 6. Non-Functional Requirements

### 6.1 Performance Constraints

- **Compute Latency:** Backend topological sorting and DAG calculation for a single cycle MUST complete in `< 50ms`.

### 6.2 Reliability & Scalability

- **Service Decoupling:** The system MUST decouple the WebSocket server (stateful real-time compute) from the REST API (stateless sharing/storage) to allow independent horizontal scaling in the future.
- **AI Code Generation Adaptation:** Project structure must enforce strict directory separation: `/frontend`, `/backend`, and `/shared`. The `/shared` directory must contain all TypeScript interfaces, serving as the Single Source of Truth for AI assistants during cross-platform code generation.
