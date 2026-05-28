import { describe, it, expect } from 'vitest';
import { calculate } from '../calcEngine.js';
import type { GraphState } from '../../../../../shared/types.js';

// ─── Helpers ────────────────────────────────────────────────────────────────

const inputNode = (id: string, value: number) => ({
  id,
  type: 'input' as const,
  value,
  isPercentage: false,
});

const outputNode = (id: string) => ({
  id,
  type: 'output' as const,
  value: 0,
  isPercentage: false,
});

const operatorNode = (id: string, op: '+' | '-' | '*' | '/') => ({
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

// ─── Test Suite 3: Operator Node Computations ───────────────────────────────

describe('calcEngine — Operator Node', () => {
  const makeOpGraph = (
    aVal: number,
    bVal: number,
    op: '+' | '-' | '*' | '/',
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
});
