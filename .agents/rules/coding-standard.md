---
trigger: glob
glob: '**/*.{ts,tsx,js,jsx,json}'
description: Standards for TypeScript, Git branching, commit messages, and testing coverage.
---

# Coding Standards

> Version: 1.0.0
> Last Updated: 2026-05-16

## Type Safety (TypeScript)

1. **Zero any Policy**: Never use the `any` type. Use `unknown` or define a proper interface.
2. **Shared First**: Always define/update types in `/shared` before implementation.
3. **Strict Mode**: Respect `tsconfig.json` settings. No `@ts-ignore` without a very strong reason and documentation.

## Testing Requirements

1. **TDD Priority**: Write unit tests BEFORE implementation.
2. **Coverage**: All core calculation logic must have 100% path coverage for boundary conditions.
3. **Environment**: Tests must pass in the target environment (Vitest for Frontend/Backend).

## Git & Branching

1. **No Direct Main**: Never commit directly to the `main` branch.
2. **Branch Naming**: `feat/description`, `fix/description`, or `refactor/description`.
3. **Commit Messages**:
   - Format: `type: [brief description]`
   - Types: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`.
4. **Pre-commit**: Husky must pass (Linting + Formatting) before any push.

## Code Quality

1. **Linting**: No ESLint or Prettier warnings allowed in new code.
2. **Documentation**: Add JSDoc comments to all public functions and complex logic blocks.
3. **DRY & SOLID**: Adhere to clean code principles.
