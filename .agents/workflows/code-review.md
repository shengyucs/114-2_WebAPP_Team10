---
description: Guidelines for auditing code logic, architectural integrity, and quality.
---

# Workflow: Code Review Assistant

> Version: 1.0.0
> Last Updated: 2026-05-16
> Task: Auditing code logic and quality.

## Checklist for Review

### 1. Architectural Integrity

- Is business logic strictly in the backend?
- Are types imported from /shared?

### 2. Logic & Security

- Does it violate the "Zero Rule" (Default 0)?
- Are there any potential circular dependencies?
- Are there any unsanitized inputs?

### 3. Quality & Style

- Are there any any types?
- Is the code readable and well-documented?
- Does it follow the established naming conventions?

## Interaction Pattern

- Provide a summary of findings.
- Highlight specific lines using code blocks.
- Suggest concrete improvements with code diffs.
