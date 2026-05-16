---
description: Safe, incremental process for improving code structure without changing behavior.
---

# Workflow: Refactoring

> Version: 1.0.0
> Last Updated: 2026-05-16
> Task: Improving code structure without changing behavior.

## Safety First

- Requirement: A passing unit test suite must exist for the target code before starting.

## Step-by-Step Process

### 1. Assessment

- Identify the "Code Smell" (e.g., long function, tight coupling).
- Propose a refactoring plan (e.g., Extract Method, Move to Helper).

### 2. Execution (Incremental)

- Make small, atomic changes.
- After each change, run `npm run test` to ensure behavior is preserved.

### 3. Verification

- Ensure the code is more readable or performant.
- Ensure type definitions are even stricter if possible.

## Forbidden Actions

- Do NOT add new features during a refactor.
- Do NOT proceed if tests are missing or failing.
