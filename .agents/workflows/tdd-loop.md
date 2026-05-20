---
description: Standard development loop using Test-Driven Development (Red-Green-Refactor).
---

# Workflow: TDD Development Loop

> Version: 2.0.0
> Last Updated: 2026-05-20
> Task: Developing new features or logic.

## Prerequisites

- Read `.agents/rules/core-rules.md`
- Read `.agents/rules/coding-standard.md`

## When to Use TDD

**TDD is mandatory for:**

- Backend logic (DAG calculation, topological sort, zone merging)
- Utility functions (validators, formatters, helpers)
- Any pure function with inputs and outputs

**TDD is NOT required for:**

- React components, UI layout, canvas interactions
- CSS / styling changes
- For UI tasks → implement directly and let the human verify in browser

---

## Step-by-Step Process

### 1. Planning & Types

1. Define or update data structures in `/shared/types.ts` first.
2. Identify the function signature: inputs, outputs, side effects.
3. List the boundary conditions you will test (see checklist below).

### 2. Write Failing Test — Red

**File naming and location:**

```
backend/src/engine/__tests__/topologicalSort.test.ts   ← backend logic
frontend/src/utils/__tests__/validateGraph.test.ts     ← frontend utilities
```

Rules:

- Test files go in a `__tests__/` folder next to the file being tested.
- File name: `[functionName].test.ts`

**Test file structure:**

```typescript
import { describe, it, expect } from 'vitest';
import { yourFunction } from '../yourFunction';

describe('yourFunction', () => {
  // Happy path
  it('returns correct result for valid input', () => {
    const result = yourFunction(/* input */);
    expect(result).toBe(/* expected */);
  });

  // The Zero Rule — all missing/undefined inputs must default to 0
  it('returns 0 when input is undefined', () => {
    expect(yourFunction(undefined)).toBe(0);
  });

  it('returns 0 when input is empty', () => {
    expect(yourFunction([])).toBe(0);
  });

  // Edge cases
  it('handles negative values correctly', () => {
    expect(yourFunction(-5)).toBe(/* expected */);
  });

  // DAG-specific: circular dependency must throw or return error
  it('throws on circular dependency', () => {
    expect(() => yourFunction(circularGraph)).toThrow();
  });
});
```

**Run to confirm RED (test fails before implementation):**

```bash
cd frontend && npx vitest run          # frontend tests
cd backend  && npx vitest run          # backend tests (once Vitest is added)
```

### 3. Implement Logic — Green

1. Implement the function so the tests pass.
2. Enforce the Business Iron Rules:
   - Any undefined/missing value → `0`, never a non-zero default
   - Business logic stays in backend, never in frontend
3. Run tests again to confirm GREEN:

```bash
npx vitest run
```

### 4. Refactor & Polish — Blue

- Remove duplication, simplify logic.
- Ensure no ESLint warnings: `npm run lint`
- Ensure no TypeScript errors: `npx tsc --noEmit`

### 5. Final Verification

```bash
npm run lint        # no ESLint errors
npx tsc --noEmit    # no TypeScript errors
npx vitest run      # all tests green
```

Commit on a feature branch — never directly to `main`.

---

## Boundary Conditions Checklist

Every logic function in this project must cover these cases:

| Case                            | Why                                               |
| ------------------------------- | ------------------------------------------------- |
| Input is `0`                    | The Zero Rule — must not be treated as "no input" |
| Input is `undefined` or missing | Must default to `0`, not throw                    |
| Empty array / empty graph       | Must return `0` or empty result, not crash        |
| Single node (no edges)          | Trivial DAG — must still compute correctly        |
| Circular dependency in graph    | Must be detected and rejected (DAG constraint)    |
| Nodes with different zones      | Must multiply, not add                            |
| Nodes with the same zone        | Must add, not multiply                            |

---

## Concrete Example — Zone Calculation

This project's core rule: **same zone = add, different zones = multiply**.

```typescript
// backend/src/engine/__tests__/calcZones.test.ts

import { describe, it, expect } from 'vitest';
import { calcZones } from '../calcZones';
import type { NodeData } from '../../../../shared/types';

describe('calcZones', () => {
  it('adds values within the same zone', () => {
    const nodes: NodeData[] = [
      {
        id: '1',
        type: 'input',
        multiplierZone: 'Attack',
        value: 100,
        isPercentage: false,
      },
      {
        id: '2',
        type: 'input',
        multiplierZone: 'Attack',
        value: 50,
        isPercentage: false,
      },
    ];
    expect(calcZones(nodes)).toBe(150); // 100 + 50
  });

  it('multiplies values across different zones', () => {
    const nodes: NodeData[] = [
      {
        id: '1',
        type: 'input',
        multiplierZone: 'Attack',
        value: 150,
        isPercentage: false,
      },
      {
        id: '2',
        type: 'input',
        multiplierZone: 'Crit',
        value: 1.5,
        isPercentage: false,
      },
    ];
    expect(calcZones(nodes)).toBe(225); // 150 × 1.5
  });

  it('returns 0 for empty input (The Zero Rule)', () => {
    expect(calcZones([])).toBe(0);
  });

  it('returns 0 when all node values are 0', () => {
    const nodes: NodeData[] = [
      {
        id: '1',
        type: 'input',
        multiplierZone: 'A',
        value: 0,
        isPercentage: false,
      },
    ];
    expect(calcZones(nodes)).toBe(0);
  });
});
```

---

## Mocking Guide

**Mock Socket.io in backend tests:**

```typescript
import { vi } from 'vitest';

const mockSocket = {
  emit: vi.fn(),
  on: vi.fn(),
};
```

**Mock MongoDB / Mongoose:**

```typescript
import { vi } from 'vitest';

vi.mock('../models/Graph', () => ({
  default: {
    findById: vi.fn().mockResolvedValue({ nodes: [], edges: [] }),
    create: vi.fn().mockResolvedValue({ id: 'test-id' }),
  },
}));
```

---

## Forbidden Actions

- Do NOT write implementation before the test file exists and fails.
- Do NOT skip the `/shared/types.ts` definition step.
- Do NOT use `any` type in test files — type your mocks properly.
- Do NOT test UI rendering with TDD — use the browser for that.
