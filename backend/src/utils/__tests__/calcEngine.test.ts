import { describe, it, expect } from 'vitest';
import { calculate } from '../calcEngine.js';
import type { GraphState } from '../../../../shared/types.js';

// ─── Helpers ────────────────────────────────────────────────────────────────

const inputNode = (id: string, value: number) => ({
  id,
  type: 'input' as const,
  value,
  isPercentage: false,
});

const pctInputNode = (id: string, value: number) => ({
  id,
  type: 'input' as const,
  value,
  isPercentage: true,
});

const outputNode = (id: string) => ({
  id,
  type: 'output' as const,
  value: 0,
  isPercentage: false,
});

const operatorNode = (
  id: string,
  op:
    | '+'
    | '-'
    | '*'
    | '/'
    | 'max'
    | 'min'
    | '>'
    | '<'
    | '='
    | '>='
    | '<='
    | '!=',
) => ({
  id,
  type: 'operator' as const,
  value: 0,
  isPercentage: false,
  operator: op,
});

const edge = (source: string, target: string, targetHandle?: string) => ({
  source,
  target,
  targetHandle,
});

// ─── Test Suite 1: DAG Topological Sorting ──────────────────────────────────

describe('calcEngine — Topological Sort', () => {
  it('processes a simple Input → Output DAG correctly', () => {
    const graph: GraphState = {
      nodes: [inputNode('a', 10), outputNode('b')],
      edges: [edge('a', 'b')],
    };
    const results = calculate(graph);
    expect(results['b']).toBe(10);
  });

  it('processes Input → Operator → Output in correct order', () => {
    const graph: GraphState = {
      nodes: [
        inputNode('a', 6),
        inputNode('b', 4),
        operatorNode('op', '+'),
        outputNode('out'),
      ],
      edges: [edge('a', 'op', 'a'), edge('b', 'op', 'b'), edge('op', 'out')],
    };
    const results = calculate(graph);
    expect(results['op']).toBe(10);
    expect(results['out']).toBe(10);
  });

  it('throws CircularDependencyError on a cycle', () => {
    const graph: GraphState = {
      nodes: [inputNode('a', 1), outputNode('b')],
      edges: [edge('a', 'b'), edge('b', 'a')],
    };
    expect(() => calculate(graph)).toThrow('CircularDependencyError');
  });
});

// ─── Test Suite 2: Simple Sum Aggregation ───────────────────────────────────

describe('calcEngine — Simple Sum Aggregation', () => {
  it('sums multiple upstream input nodes into one output', () => {
    const graph: GraphState = {
      nodes: [inputNode('a', 100), inputNode('b', 50), outputNode('out')],
      edges: [edge('a', 'out'), edge('b', 'out')],
    };
    const results = calculate(graph);
    expect(results['out']).toBe(150);
  });

  it('returns 0 for an isolated output node (The Zero Rule)', () => {
    const graph: GraphState = {
      nodes: [outputNode('out')],
      edges: [],
    };
    const results = calculate(graph);
    expect(results['out']).toBe(0);
  });

  it('returns 0 for an empty graph', () => {
    const graph: GraphState = { nodes: [], edges: [] };
    const results = calculate(graph);
    expect(Object.keys(results)).toHaveLength(0);
  });

  it('returns 0 when input node value is 0 (The Zero Rule)', () => {
    const graph: GraphState = {
      nodes: [inputNode('a', 0), outputNode('out')],
      edges: [edge('a', 'out')],
    };
    expect(calculate(graph)['out']).toBe(0);
  });
});

// ─── Test Suite 3: isPercentage Conversion ──────────────────────────────────

describe('calcEngine — isPercentage', () => {
  it('converts value=15 with isPercentage=true to 1.15', () => {
    const graph: GraphState = {
      nodes: [pctInputNode('a', 15), outputNode('out')],
      edges: [edge('a', 'out')],
    };
    expect(calculate(graph)['a']).toBe(1.15);
  });

  it('applies percentage bonus: base × (1 + pct/100)', () => {
    const graph: GraphState = {
      nodes: [
        inputNode('base', 200),
        pctInputNode('bonus', 15),
        operatorNode('op', '*'),
        outputNode('out'),
      ],
      edges: [
        edge('base', 'op', 'a'),
        edge('bonus', 'op', 'b'),
        edge('op', 'out'),
      ],
    };
    // 200 × 1.15 = 230 (floating point: use toBeCloseTo)
    expect(calculate(graph)['op']).toBeCloseTo(230, 10);
    expect(calculate(graph)['out']).toBeCloseTo(230, 10);
  });

  it('converts value=0 with isPercentage=true to 1.0 (zero bonus)', () => {
    const graph: GraphState = {
      nodes: [pctInputNode('a', 0), outputNode('out')],
      edges: [edge('a', 'out')],
    };
    expect(calculate(graph)['a']).toBe(1.0);
  });

  it('converts value=100 with isPercentage=true to 2.0 (double)', () => {
    const graph: GraphState = {
      nodes: [pctInputNode('a', 100), outputNode('out')],
      edges: [edge('a', 'out')],
    };
    expect(calculate(graph)['a']).toBe(2.0);
  });
});

// ─── Test Suite 4: Operator Node Computations ───────────────────────────────

describe('calcEngine — Operator Node', () => {
  const makeOpGraph = (
    aVal: number,
    bVal: number,
    op:
      | '+'
      | '-'
      | '*'
      | '/'
      | 'max'
      | 'min'
      | '>'
      | '<'
      | '='
      | '>='
      | '<='
      | '!=',
  ): GraphState => ({
    nodes: [
      inputNode('a', aVal),
      inputNode('b', bVal),
      operatorNode('op', op),
      outputNode('out'),
    ],
    edges: [edge('a', 'op', 'a'), edge('b', 'op', 'b'), edge('op', 'out')],
  });

  it('adds A + B', () => {
    expect(calculate(makeOpGraph(3, 7, '+'))['op']).toBe(10);
  });

  it('multiplies A * B', () => {
    expect(calculate(makeOpGraph(4, 5, '*'))['op']).toBe(20);
  });

  it('subtracts A - B (non-commutative: handle A first)', () => {
    expect(calculate(makeOpGraph(10, 3, '-'))['op']).toBe(7);
  });

  it('divides A / B (non-commutative: handle A first)', () => {
    expect(calculate(makeOpGraph(10, 2, '/'))['op']).toBe(5);
  });

  it('returns 0 for division by zero (safe fallback)', () => {
    expect(calculate(makeOpGraph(10, 0, '/'))['op']).toBe(0);
  });

  it('defaults missing handle A to 0', () => {
    const graph: GraphState = {
      nodes: [inputNode('b', 5), operatorNode('op', '+'), outputNode('out')],
      edges: [edge('b', 'op', 'b'), edge('op', 'out')],
    };
    // A = 0 (disconnected), B = 5 → 0 + 5 = 5
    expect(calculate(graph)['op']).toBe(5);
  });

  it('defaults missing handle B to 0', () => {
    const graph: GraphState = {
      nodes: [inputNode('a', 8), operatorNode('op', '*'), outputNode('out')],
      edges: [edge('a', 'op', 'a'), edge('op', 'out')],
    };
    // A = 8, B = 0 (disconnected) → 8 * 0 = 0
    expect(calculate(graph)['op']).toBe(0);
  });

  it('calculates max(A, B)', () => {
    // max(3, 7) = 7, max(12, -2) = 12
    expect(calculate(makeOpGraph(3, 7, 'max'))['op']).toBe(7);
    expect(calculate(makeOpGraph(12, -2, 'max'))['op']).toBe(12);
  });

  it('calculates min(A, B)', () => {
    // min(3, 7) = 3, min(12, -2) = -2
    expect(calculate(makeOpGraph(3, 7, 'min'))['op']).toBe(3);
    expect(calculate(makeOpGraph(12, -2, 'min'))['op']).toBe(-2);
  });

  it('calculates A > B comparison', () => {
    // 5 > 3 = 1, 3 > 5 = 0, 3 > 3 = 0
    expect(calculate(makeOpGraph(5, 3, '>'))['op']).toBe(1);
    expect(calculate(makeOpGraph(3, 5, '>'))['op']).toBe(0);
    expect(calculate(makeOpGraph(3, 3, '>'))['op']).toBe(0);
  });

  it('calculates A < B comparison', () => {
    // 3 < 5 = 1, 5 < 3 = 0, 3 < 3 = 0
    expect(calculate(makeOpGraph(3, 5, '<'))['op']).toBe(1);
    expect(calculate(makeOpGraph(5, 3, '<'))['op']).toBe(0);
    expect(calculate(makeOpGraph(3, 3, '<'))['op']).toBe(0);
  });

  it('calculates A = B comparison', () => {
    // 5 = 5 = 1, 5 = 3 = 0
    expect(calculate(makeOpGraph(5, 5, '='))['op']).toBe(1);
    expect(calculate(makeOpGraph(5, 3, '='))['op']).toBe(0);
  });

  it('calculates A >= B comparison', () => {
    // 5 >= 3 = 1, 3 >= 5 = 0, 3 >= 3 = 1
    expect(calculate(makeOpGraph(5, 3, '>='))['op']).toBe(1);
    expect(calculate(makeOpGraph(3, 5, '>='))['op']).toBe(0);
    expect(calculate(makeOpGraph(3, 3, '>='))['op']).toBe(1);
  });

  it('calculates A <= B comparison', () => {
    // 3 <= 5 = 1, 5 <= 3 = 0, 3 <= 3 = 1
    expect(calculate(makeOpGraph(3, 5, '<='))['op']).toBe(1);
    expect(calculate(makeOpGraph(5, 3, '<='))['op']).toBe(0);
    expect(calculate(makeOpGraph(3, 3, '<='))['op']).toBe(1);
  });

  it('calculates A != B comparison', () => {
    // 5 != 3 = 1, 5 != 5 = 0
    expect(calculate(makeOpGraph(5, 3, '!='))['op']).toBe(1);
    expect(calculate(makeOpGraph(5, 5, '!='))['op']).toBe(0);
  });
});

describe('calcEngine — Conditional Node', () => {
  const conditionalNode = (id: string) => ({
    id,
    type: 'conditional' as unknown as 'input',
    value: 0,
    isPercentage: false,
  });

  it('returns T (then) value when condition is non-zero (true)', () => {
    const graph: GraphState = {
      nodes: [
        inputNode('cond', 1),
        inputNode('t', 10),
        inputNode('f', 20),
        conditionalNode('cond_node'),
        outputNode('out'),
      ],
      edges: [
        edge('cond', 'cond_node', 'cond'),
        edge('t', 'cond_node', 't'),
        edge('f', 'cond_node', 'f'),
        edge('cond_node', 'out'),
      ],
    };
    const results = calculate(graph);
    expect(results['cond_node']).toBe(10);
    expect(results['out']).toBe(10);
  });

  it('returns F (else) value when condition is zero (false)', () => {
    const graph: GraphState = {
      nodes: [
        inputNode('cond', 0),
        inputNode('t', 10),
        inputNode('f', 20),
        conditionalNode('cond_node'),
        outputNode('out'),
      ],
      edges: [
        edge('cond', 'cond_node', 'cond'),
        edge('t', 'cond_node', 't'),
        edge('f', 'cond_node', 'f'),
        edge('cond_node', 'out'),
      ],
    };
    const results = calculate(graph);
    expect(results['cond_node']).toBe(20);
    expect(results['out']).toBe(20);
  });

  it('defaults missing handles to zero', () => {
    const graph: GraphState = {
      nodes: [inputNode('t', 99), conditionalNode('cond_node')],
      edges: [
        edge('t', 'cond_node', 't'), // cond is missing (0), f is missing (0)
      ],
    };
    // cond = 0 (false) -> returns f = 0 (disconnected)
    const results = calculate(graph);
    expect(results['cond_node']).toBe(0);
  });
});
