---
trigger: always_on
description: Project mission, tech stack, and non-negotiable business iron rules.
---

# Core Rules

> Version: 1.1.0
> Last Updated: 2026-05-16

## Project Mission

Build a flexible, WYSIWYG node-based calculator to visualize and compute complex status additions (e.g., RPG stats, buffs, logic gates).

## Tech Stack

- **Frontend**: React 18+, TypeScript, Zustand, React Flow, Tailwind CSS.
- **Backend**: Node.js, Express, Socket.io, TypeScript.
- **Database**: MongoDB with Mongoose.
- **Shared**: Centralized TypeScript interfaces in `/shared`.

## Infrastructure & Environment

### Networking

- **Internal Service Names (Docker)**:
  - MongoDB: `mongodb:27017`
  - Backend: `backend:5000`
- **Exposed Ports**:
  - Frontend: `5173`
  - Backend: `5000`
  - Debugger: `9229`

### Environment Files

- **Local Development**: Uses `.env` files in `/frontend` and `/backend`.
- **Docker Development**:
  - Backend MUST use `backend/.env.docker`.
  - Frontend API URL: `http://localhost:5000`.

## Business Iron Rules (Non-negotiable)

1. **The Zero Rule**: The calculation engine MUST NOT have any default non-zero values.
   - Any undefined input = 0.
   - Any missing node value = 0.
   - Default state of any numeric field is 0.
2. **Logic Placement**: Business logic and calculations MUST reside in the **Backend**. The Frontend is responsible only for UI rendering, state synchronization, and user interaction.
3. **No Circular Dependencies**: The node graph must maintain a Directed Acyclic Graph (DAG) structure. Circular references must be detected and prevented.
4. **Multiplication Zone Rule**: Within a specific "Zone", additions occur first, followed by cross-zone multiplications.

## Development Requirements

- **Environment**: Must work in both local (`npm run dev`) and Docker (`npm run docker:dev`) environments.
- **Diagnostics**: Run `npm run doctor` to verify environment health before major tasks.
