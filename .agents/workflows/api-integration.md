---
description: Workflow for connecting Frontend and Backend with strict type safety.
---

# Workflow: API Integration

> Version: 1.0.0
> Last Updated: 2026-05-16
> Task: Connecting Frontend to Backend via REST or Socket.io.

## Step-by-Step Process

### 1. Contract Definition

- Update /shared/types.ts with the Request and Response interfaces.
- Define the endpoint path and HTTP method (or Socket event name).

### 2. Backend Implementation

- Create the Controller and Route.
- Add validation logic (Joi/Zod) using the shared types.
- Test the endpoint (e.g., using a Vitest integration test or a scratch script).

### 3. Frontend Implementation

- Create the API client function or the Socket.io listener.
- Use the shared types for the API call.
- Handle loading, error, and success states in the UI.

### 4. End-to-End Verification

- Start the full stack (npm run docker:dev or npm run dev).
- Manually verify the interaction in the browser.

## Best Practice

- Always use the /shared directory to ensure both ends agree on the data format.
