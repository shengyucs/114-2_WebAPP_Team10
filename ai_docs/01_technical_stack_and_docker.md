# 01: Technical Stack & Docker Configuration

This document provides specific technical details regarding the project's infrastructure and containerization setup.

## 1. Project Architecture

### Directory Structure

- `/frontend`: React + Vite + TypeScript. Client-side application.
- `/backend`: Node.js + Express + TypeScript. API service.
- `/shared`: Common TypeScript interfaces/types. **CRITICAL**: Always modify types here first.
- `/scripts`: Automation tools (`init.js`, `doctor.js`).

## 2. Docker Infrastructure

### Build Strategy

- **Context**: The Docker build context is the **Project Root**.
- **Base Image**: `node:20-alpine`.

### Networking

- **Internal Network**: Docker Compose services are reachable by their names.
  - MongoDB: `mongodb:27017`
  - Backend: `backend:5000`
- **Exposed Ports**:
  - Frontend: `5173`
  - Backend: `5000`
  - Debugger: `9229`

### Hot Reloading

- Handled via Bind Mounts in `docker-compose.yml`.
- `node_modules` are excluded from host mounting.

## 3. Environment Configurations

- **Local Development**: Uses `.env` files in respective folders.
- **Docker Development**:
  - Backend uses `backend/.env.docker`.
  - Frontend uses `VITE_API_URL=http://localhost:5000`.

## 4. Automation & Maintenance

- Run `npm run init` for setup.
- Run `npm run doctor` for system health checks.

## 5. Debugging Guide

### Backend Debugging

- Use **"Attach to Backend (Docker)"** in `.vscode/launch.json`.
- Debug Port: `9229`.

### Frontend Debugging

- Debug in host browser (Chrome DevTools).

## 6. Testing Strategy

### Frontend Testing

- **Framework**: Vitest + React Testing Library.
- **Command**: `npm test` from root.

### Backend Testing

- Currently a placeholder. Recommended: Vitest + Supertest.
