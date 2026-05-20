# CLAUDE.md — AI Agent Entry Point

> This file is automatically loaded by Claude Code at conversation start.

## Mandatory Pre-Task Protocol

Before starting ANY implementation task you MUST read the following files **in order**:

1. `AI_AGENT.md` — project AI entry point and confirmation protocol
2. `.agents/rules/core-rules.md` — tech stack, business iron rules, networking
3. `.agents/rules/coding-standard.md` — TypeScript, Git, testing standards
4. `.agents/rules/ui-standard.md` — visual design language
5. `.agents/rules/persona.md` — role and communication protocols

After reading, state: **「AI Agent 規則已確認，已讀取 .agents/rules，準備接受任務」**

Pick the matching workflow before coding:

| Task Type            | Workflow                               |
| -------------------- | -------------------------------------- |
| New feature or logic | `.agents/workflows/tdd-loop.md`        |
| Bug fix              | `.agents/workflows/bug-fixing.md`      |
| Refactoring          | `.agents/workflows/refactoring.md`     |
| API integration      | `.agents/workflows/api-integration.md` |

## Testing Policy

| Task Type                                             | Testing Required                                                       |
| ----------------------------------------------------- | ---------------------------------------------------------------------- |
| Backend logic, algorithms, DAG calculation, utilities | **TDD mandatory** — write failing tests first, implement second        |
| UI tasks (React components, canvas, styles, layout)   | **No automated tests** — implement directly, human verifies in browser |

## Project Quick Reference

```
/frontend   — React 18, TypeScript, Zustand, React Flow, Tailwind CSS
/backend    — Node.js, Express, Socket.io, TypeScript
/shared     — TypeScript interfaces (Single Source of Truth — update here first)
```

## Core Constraints (summary)

- Business logic only in backend; frontend handles UI + state sync only
- All TypeScript types defined in `shared/types.ts` before implementation
- Zero `any` — use `unknown` or a proper interface
- All numeric defaults must be `0` (The Zero Rule)
- DAG structure only — detect and block circular dependencies
- Never commit directly to `main`; use `feat/`, `fix/`, or `refactor/` branches
