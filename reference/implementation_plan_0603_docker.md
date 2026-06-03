# Implementation Plan: Production Docker Packaging & Single-Container Deployment

> Date: 2026-06-03
> Version: 1.1.0
> Replaces: [implementation_plan_0603.md](file:///d:/GitHub/114-2_WebAPP_Team10/reference/implementation_plan_0603.md)

This plan outlines changes to build, package, and deploy the entire Status Node Calculator as a single, lightweight Docker container, suitable for deployment on any cloud service or server.

---

## Technical Approach

To achieve "deployable on any device with a single Docker command," we will consolidate the frontend and backend into a single container:

1. **Production Assets Serving**: In production mode (`NODE_ENV=production`), the backend Express server will serve the static React frontend assets compiled in `/frontend/dist`.
2. **Multi-Stage Build**:
   - **Stage 1 (Frontend Builder)**: Compiles the React + Vite frontend to static assets (`/frontend/dist`).
   - **Stage 2 (Backend Builder)**: Compiles the TypeScript backend into JavaScript in `/backend/dist`.
   - **Stage 3 (Runner)**: A clean `node:20-alpine` image containing only production dependencies, the compiled backend files, and the static frontend files.
3. **Single Container Operation**: Running this container starts the Express backend on port `5000` which also serves the React UI.

---

## User Review Required

> [!IMPORTANT]
> **Single Container Port**
> The entire application will run on port `5000` in production. Accessing `http://<host>:5000/` will render the frontend UI, and WebSocket connections will connect natively to the same port.
>
> **Docker Compose for Production**
> We will add a `docker-compose.prod.yml` file to run the production image locally or on a VPS with a single command.

---

## Proposed Changes

### Backend Source & Package Config

#### [MODIFY] [package.json (backend)](file:///d:/GitHub/114-2_WebAPP_Team10/backend/package.json)

- Add the `"build": "tsc"` script.

#### [MODIFY] [index.ts (backend)](file:///d:/GitHub/114-2_WebAPP_Team10/backend/src/index.ts)

- Add path resolution and express static file serving logic for `NODE_ENV === 'production'`.
- Fallback route `*` to serve `index.html` for client-side routing.

---

### Docker Configurations

#### [NEW] [Dockerfile (root)](file:///d:/GitHub/114-2_WebAPP_Team10/Dockerfile)

- Create a multi-stage production Dockerfile at the project root building frontend, backend, and running the single-container production app.

#### [NEW] [docker-compose.prod.yml (root)](file:///d:/GitHub/114-2_WebAPP_Team10/docker-compose.prod.yml)

- Create a production Docker Compose configuration to easily build and run the production image on port `5000`.

---

### Documentation

#### [MODIFY] [README.md](file:///d:/GitHub/114-2_WebAPP_Team10/README.md)

- Add a new section **"💿 雲端與生產環境部署 (Production Deployment)"** explaining how to build and run the production Docker container.

---

## Verification Plan

### Automated Tests

- Run `npm run build --prefix backend` to verify backend TypeScript compiles successfully to `/backend/dist`.
- Run `npm test` to ensure all tests still pass.

### Manual Verification

- Build the production image:
  `docker compose -f docker-compose.prod.yml build`
- Start the production container:
  `docker compose -f docker-compose.prod.yml up`
- Verify that opening `http://localhost:5000/` loads the UI and WebSocket connects correctly to the API.
