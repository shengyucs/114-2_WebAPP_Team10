---
description: Standard development loop using Test-Driven Development (Red-Green-Refactor).
---

# Workflow: TDD Development Loop

> Version: 1.0.0
> Last Updated: 2026-05-16
> Task: Developing new features or logic.

## Prerequisites

- Read .agents/rules/core-rules.md
- Read .agents/rules/coding-standard.md

## Step-by-Step Process

### 1. Planning & Types

- Define the data structures in /shared/types.ts.
- Verify the plan with the User.

### 2. Write Failing Test (Red)

- Use the following template to generate a test file:
  ```markdown
  Generate a unit test for: [Function Name]
  Description: [What it does]
  Test Framework: Vitest
  Path: [File Path]
  Boundary Conditions: [List cases]
  ```
- Run `npm run test` to confirm it fails.

### 3. Implement Logic (Green)

- Implement the function in the corresponding directory.
- Ensure "Business Iron Rules" are followed (e.g., Default 0).
- Run `npm run test` to confirm it passes.

### 4. Refactor & Polish (Blue)

- Clean up the code, optimize performance.
- Ensure no Linting or TypeScript errors.

### 5. Final Verification

- Run full suite: `npm run lint`, `npm run type-check`.
- Commit changes using a feature branch.

## Forbidden Actions

- Do NOT write implementation before tests.
- Do NOT skip the /shared type definition step.
