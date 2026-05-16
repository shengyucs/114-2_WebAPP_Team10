---
trigger: model_decision
description: Technical details on Docker infrastructure, networking, and debugging tools.
---

# Infrastructure & Docker Internals

> Version: 1.0.0
> Last Updated: 2026-05-16

## Docker Strategy

- **Base Image**: `node:20-alpine`.
- **Build Context**: Project Root.
- **Hot Reloading**: Enabled via bind mounts in `docker-compose.yml`.
- **Note**: `node_modules` are excluded from host mounting to prevent platform conflicts.

## Debugging Guide

### Backend Debugging

- **Debugger Port**: `9229`.
- **VS Code Setup**: Use the "Attach to Backend (Docker)" configuration in `.vscode/launch.json`.

### Frontend Debugging

- **Method**: Debug directly in the host browser (Chrome/Firefox DevTools).
- **API Proxy**: Frontend connects to `http://localhost:5000` via Vite proxy or env variable.

## Automation Commands

- `npm run init`: Full project initialization.
- `npm run doctor`: Environment health and dependency check.
- `npm run docker:dev`: Start the full stack in Docker.
- `npm run dev`: Start the hybrid local development mode.
