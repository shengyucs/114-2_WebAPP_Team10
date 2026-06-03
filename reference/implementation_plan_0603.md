# Implementation Plan: Stateless & Decentralized Status Node Calculator (Final Integration)

> Date: 2026-06-03
> Version: 1.0.0
> Replaces: [implementation_plan_0526.md](file:///d:/GitHub/114-2_WebAPP_Team10/reference/implementation_plan_0526.md)

This implementation plan bridges the gap between the Software Requirement Specification (SRS) and the current project state. It focuses on implementing frontend cycle prevention, LZ-string anonymous sharing, Google Drive permissions public sharing API, URL routing hydration, and key shortcut configurations.

---

## Gap Analysis & Current Status

| Phase / Requirement                          | Status               | Remaining Work                                                                                                                                        |
| -------------------------------------------- | -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Phase 0: Decommission MongoDB**            | **Completed (100%)** | None. MongoDB container and Mongoose dependencies have been removed.                                                                                  |
| **Phase 1: Shared Types & Core Definitions** | **Completed (100%)** | None. `shared/types.ts` is fully simplified.                                                                                                          |
| **Phase 1.5: Frontend DFS Cycle Prevention** | **Pending (0%)**     | Implement `cycleDetection.ts` helper. Block cyclic connections in Zustand `onConnect` and React Flow's `isValidConnection` callback.                  |
| **Phase 2: Backend Compute Engine & Vitest** | **Completed (100%)** | None. Calculations, topological sort, and safe division-by-zero are tested and operational.                                                           |
| **Phase 3: LZ-String URL Anonymous Sharing** | **Pending (0%)**     | Install `lz-string`. Implement JSON compression, hash URL generation (`#/s/...`), clipboard copying, and toast UI feedback.                           |
| **Phase 3.5: Google Drive Public Sharing**   | **Pending (20%)**    | Google Drive login, file listing, saving, loading work. Need to add `permissions` API to make files public and generate sharing link (`#/drive/...`). |
| **Phase 4: State Hydration via URL Router**  | **Pending (0%)**     | Check URL hash on startup: decompress `#/s/...` state, or anonymously download `#/drive/...` file from Google Drive, and hydrate the Zustand store.   |
| **Phase 5: Canvas Key Shortcut & Cleanup**   | **Pending (50%)**    | Set `deleteKeyCode="Delete"` in React Flow. Prune legacy fields (`multiplierZone`, etc.) in `useGoogleStore.ts` load mapping.                         |

---

## User Review Required

> [!IMPORTANT]
> **1. Package Installation**
> We will install `lz-string` and its typescript types `@types/lz-string` into `frontend`.
>
> **2. Google Drive Permissions OAuth Scope**
> The current OAuth scope `https://www.googleapis.com/auth/drive.file` is sufficient to update permissions on files created by this app. No extra scopes or user approvals are needed.
>
> **3. UI Location for Sharing**
> We will add a clean "Share" panel in the UI (e.g. next to the Google Drive Cloud Panel) that offers:
>
> - **Copy Shareable Link (Anonymous)**: Compresses the graph and copies a `#/s/...` link.
> - **Publish & Share Link (Google Drive)**: Available when connected. Uploads, permissions-shares, and copies a `#/drive/...` link.

---

## Proposed Changes

### Component 1: Frontend Dependency & Cycle Prevention

#### [MODIFY] [package.json (frontend)](file:///d:/GitHub/114-2_WebAPP_Team10/frontend/package.json)

- Add `"lz-string": "^1.5.0"` to `dependencies`.
- Add `"@types/lz-string": "^1.5.0"` to `devDependencies`.

#### [NEW] [cycleDetection.ts (frontend)](file:///d:/GitHub/114-2_WebAPP_Team10/frontend/src/utils/cycleDetection.ts)

- Implement a Depth-First Search (DFS) algorithm to detect cycles when attempting to connect nodes.
- Expose `wouldIntroduceCycle(nodes, edges, connection)` to check if a new connection introduces a cycle.

#### [MODIFY] [useStore.ts (frontend)](file:///d:/GitHub/114-2_WebAPP_Team10/frontend/src/store/useStore.ts)

- Import `wouldIntroduceCycle` from `cycleDetection.ts`.
- In `onConnect`, check if the connection introduces a cycle. If it does, ignore the connection.

---

### Component 2: Sharing Services & URL Routing

#### [MODIFY] [googleDrive.ts (frontend)](file:///d:/GitHub/114-2_WebAPP_Team10/frontend/src/services/googleDrive.ts)

- Add `shareFilePublicly(fileId: string): Promise<void>`:
  - Performs `POST https://www.googleapis.com/drive/v3/files/{fileId}/permissions` with body `{ role: 'reader', type: 'anyone' }`.
- Add `downloadPublicFile(fileId: string): Promise<GraphState>`:
  - Fetches from `https://www.googleapis.com/drive/v3/files/{fileId}?alt=media` without sending the `Authorization` header, allowing anonymous load of shared builds.

#### [MODIFY] [useGoogleStore.ts (frontend)](file:///d:/GitHub/114-2_WebAPP_Team10/frontend/src/store/useGoogleStore.ts)

- Prune legacy node mappings in `loadCloudGraph` (remove `multiplierZone`, `startTime`, `endTime`).
- Add `shareCurrentGraphPublicly(): Promise<string>`:
  - Saves the current graph if not saved, calls `shareFilePublicly`, and returns the URL `window.location.origin + window.location.pathname + '#/drive/' + fileId`.

---

### Component 3: UI Integration, URL Hydration, and Key Shortcuts

#### [MODIFY] [Canvas.tsx (frontend)](file:///d:/GitHub/114-2_WebAPP_Team10/frontend/src/components/Canvas.tsx)

- Set React Flow's `deleteKeyCode` to `'Delete'` to match standard keyboard expectations.
- Pass `isValidConnection` callback to `<ReactFlow>` that checks `wouldIntroduceCycle` to visually block connecting loops in real time.

#### [MODIFY] [App.tsx (frontend)](file:///d:/GitHub/114-2_WebAPP_Team10/frontend/src/App.tsx)

- Add a route checker in `useEffect` on mount to check `window.location.hash`:
  - If it matches `#/s/{data}`, decompress using `lz-string` and set nodes/edges in useStore.
  - If it matches `#/drive/{fileId}`, call `downloadPublicFile` from `GoogleDriveService` and set nodes/edges in useStore.
  - If loaded, clear hash or redirect to base URL.

#### [NEW] [SharePanel.tsx (frontend)](file:///d:/GitHub/114-2_WebAPP_Team10/frontend/src/components/features/SharePanel.tsx)

- Create a sharing button/widget that shows:
  - "Copy Anonymous Share Link" (uses lz-string).
  - "Publish to Google Drive & Copy Link" (uses Google Drive sharing service).
- Integrate it into the Toolbox or header layout.

---

## Expert Suggestions & Mentorship

1. **Vite Proxy & API URL**:
   Ensure `import.meta.env.VITE_API_URL` is set correctly during production deployment to point to the server, and defaults safely to `http://localhost:5000` locally.
2. **LZ-String URL safety**:
   Use `LZString.compressToEncodedURIComponent(json)` to ensure the generated base64 string is 100% URL-safe and doesn't get corrupted by browser url decoding.
3. **Google API Client script**:
   Ensure Google Identity Services (`https://accounts.google.com/gsi/client`) is loaded in `frontend/index.html` to prevent `google is not defined` errors.

---

## Verification Plan

### Automated Tests (Vitest)

- **Cycle Prevention tests**: Write unit tests for `wouldIntroduceCycle` verifying both normal DAGs and cyclic connections.
- **LZ-String compression tests**: Write unit tests to check state serialization, compression, and decompression back to original data.

### Manual Verification

- **Visual Cycle Blocking**: Draw a line from output back to input. React Flow should not snap/allow connection.
- **Anonymous URL Share**: Configure a graph, click "Copy Share Link", paste it in another incognito window, and verify the graph loads exactly.
- **Drive Share Link**: Connect Drive, click "Publish", copy public link, open in incognito (with no Drive login), and verify the graph loads anonymously.
