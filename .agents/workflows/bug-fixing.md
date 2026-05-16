---
description: Systematic process for diagnosing, reproducing, and fixing bugs.
---

# Workflow: Bug Fixing

> Version: 1.0.0
> Last Updated: 2026-05-16
> Task: Diagnosing and repairing errors.

## Step-by-Step Process

### 1. Reproduction

- Request the error message and the steps taken to trigger it.
- Create a minimal reproduction test case in a `*.test.ts` file.
- Confirm the test fails (Red).

### 2. Diagnosis

- Analyze the stack trace and relevant files.
- Explain the root cause to the User.

### 3. Repair

- Implement the fix.
- Verify the reproduction test case now passes (Green).
- Ensure no regressions by running the full test suite.

### 4. Cleanup

- Remove any temporary logging or debug code.
- Commit with a `fix: [description]` message.

## Best Practice

- Always check if the bug was caused by a violation of "Core Rules" (e.g., a hidden default value).
