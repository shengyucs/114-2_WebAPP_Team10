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
  op: '+' | '-' | '*' | '/' | 'max' | 'min',
) => ({
  id,
  type: 'operator' as const,
  value: 0,
  isPercentage: false,
  operator: op,
});

const ifelseNode = (
  id: string,
  cond: '>' | '<' | '=' | '>=' | '<=' | '!=',
) => ({
  id,
  type: 'ifelse' as const,
  value: 0,
  isPercentage: false,
  condition: cond,
});

const defineNode = (id: string, key: string, value = 0) => ({
  id,
  type: 'define' as const,
  value,
  isPercentage: false,
  variableKey: key,
});

const getNode = (id: string, key: string) => ({
  id,
  type: 'get' as const,
  value: 0,
  isPercentage: false,
  variableKey: key,
});

const setNode = (id: string, key: string) => ({
  id,
  type: 'set' as const,
  value: 0,
  isPercentage: false,
  variableKey: key,
});

const edge = (
  source: string,
  target: string,
  targetHandle?: string,
  sourceHandle?: string,
) => ({ source, target, targetHandle, sourceHandle });

// ─── Test Suite 1: DAG Topological Sorting ──────────────────────────────────

describe('calcEngine — Topological Sort', () => {
  it('processes a simple Input → Output DAG correctly', () => {
    const graph: GraphState = {
      nodes: [inputNode('a', 10), outputNode('b')],
      edges: [edge('a', 'b')],
    };
    const { results } = calculate(graph);
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
    const { results } = calculate(graph);
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
    const { results } = calculate(graph);
    expect(results['out']).toBe(150);
  });

  it('returns 0 for an isolated output node (The Zero Rule)', () => {
    const graph: GraphState = {
      nodes: [outputNode('out')],
      edges: [],
    };
    const { results } = calculate(graph);
    expect(results['out']).toBe(0);
  });

  it('returns 0 for an empty graph', () => {
    const graph: GraphState = { nodes: [], edges: [] };
    const { results } = calculate(graph);
    expect(Object.keys(results)).toHaveLength(0);
  });

  it('returns 0 when input node value is 0 (The Zero Rule)', () => {
    const graph: GraphState = {
      nodes: [inputNode('a', 0), outputNode('out')],
      edges: [edge('a', 'out')],
    };
    expect(calculate(graph).results['out']).toBe(0);
  });
});

// ─── Test Suite 3: isPercentage Conversion ──────────────────────────────────

describe('calcEngine — isPercentage', () => {
  it('converts value=15 with isPercentage=true to 1.15', () => {
    const graph: GraphState = {
      nodes: [pctInputNode('a', 15), outputNode('out')],
      edges: [edge('a', 'out')],
    };
    expect(calculate(graph).results['a']).toBe(1.15);
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
    expect(calculate(graph).results['op']).toBeCloseTo(230, 10);
    expect(calculate(graph).results['out']).toBeCloseTo(230, 10);
  });

  it('converts value=0 with isPercentage=true to 1.0 (zero bonus)', () => {
    const graph: GraphState = {
      nodes: [pctInputNode('a', 0), outputNode('out')],
      edges: [edge('a', 'out')],
    };
    expect(calculate(graph).results['a']).toBe(1.0);
  });

  it('converts value=100 with isPercentage=true to 2.0 (double)', () => {
    const graph: GraphState = {
      nodes: [pctInputNode('a', 100), outputNode('out')],
      edges: [edge('a', 'out')],
    };
    expect(calculate(graph).results['a']).toBe(2.0);
  });
});

// ─── Test Suite 4: Operator Node Computations (Math Only) ───────────────────

describe('calcEngine — Operator Node', () => {
  const makeOpGraph = (
    aVal: number,
    bVal: number,
    op: '+' | '-' | '*' | '/' | 'max' | 'min',
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
    expect(calculate(makeOpGraph(3, 7, '+')).results['op']).toBe(10);
  });

  it('multiplies A * B', () => {
    expect(calculate(makeOpGraph(4, 5, '*')).results['op']).toBe(20);
  });

  it('subtracts A - B', () => {
    expect(calculate(makeOpGraph(10, 3, '-')).results['op']).toBe(7);
  });

  it('divides A / B', () => {
    expect(calculate(makeOpGraph(10, 2, '/')).results['op']).toBe(5);
  });

  it('returns 0 for division by zero (safe fallback)', () => {
    expect(calculate(makeOpGraph(10, 0, '/')).results['op']).toBe(0);
  });

  it('defaults missing handle A to 0', () => {
    const graph: GraphState = {
      nodes: [inputNode('b', 5), operatorNode('op', '+'), outputNode('out')],
      edges: [edge('b', 'op', 'b'), edge('op', 'out')],
    };
    expect(calculate(graph).results['op']).toBe(5);
  });

  it('defaults missing handle B to 0', () => {
    const graph: GraphState = {
      nodes: [inputNode('a', 8), operatorNode('op', '*'), outputNode('out')],
      edges: [edge('a', 'op', 'a'), edge('op', 'out')],
    };
    expect(calculate(graph).results['op']).toBe(0);
  });

  it('calculates max(A, B)', () => {
    expect(calculate(makeOpGraph(3, 7, 'max')).results['op']).toBe(7);
    expect(calculate(makeOpGraph(12, -2, 'max')).results['op']).toBe(12);
  });

  it('calculates min(A, B)', () => {
    expect(calculate(makeOpGraph(3, 7, 'min')).results['op']).toBe(3);
    expect(calculate(makeOpGraph(12, -2, 'min')).results['op']).toBe(-2);
  });

  it('propagates NaN input: NaN + 5 = NaN', () => {
    // When an IfElse inactive path feeds NaN into an Operator, it should propagate
    const graph: GraphState = {
      nodes: [
        ifelseNode('ie', '>'), // 0 > 5 = false → true output = NaN
        inputNode('threshold', 5),
        inputNode('zero', 0),
        inputNode('addend', 10),
        operatorNode('op', '+'), // NaN + 10 = NaN
        outputNode('out'), // NaN treated as 0 in sum
      ],
      edges: [
        edge('zero', 'ie', 'a'),
        edge('threshold', 'ie', 'b'),
        // true output (NaN when 0 > 5 is false) feeds into op as A
        edge('ie', 'op', 'a', 'true'),
        edge('addend', 'op', 'b'),
        edge('op', 'out'),
      ],
    };
    const { results } = calculate(graph);
    expect(isNaN(results['op'])).toBe(true);
    // Output node skips NaN → sum = 0
    expect(results['out']).toBe(0);
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
    const { results } = calculate(graph);
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
    const { results } = calculate(graph);
    expect(results['cond_node']).toBe(20);
    expect(results['out']).toBe(20);
  });

  it('defaults missing handles to zero', () => {
    const graph: GraphState = {
      nodes: [inputNode('t', 99), conditionalNode('cond_node')],
      edges: [edge('t', 'cond_node', 't')],
    };
    const { results } = calculate(graph);
    expect(results['cond_node']).toBe(0);
  });
});

// ─── Test Suite 5: IfElse Node ───────────────────────────────────────────────

describe('calcEngine — IfElse Node', () => {
  const makeIfelseGraph = (
    aVal: number,
    bVal: number,
    cond: '>' | '<' | '=' | '>=' | '<=' | '!=',
  ): GraphState => ({
    nodes: [inputNode('a', aVal), inputNode('b', bVal), ifelseNode('ie', cond)],
    edges: [edge('a', 'ie', 'a'), edge('b', 'ie', 'b')],
  });

  it('true output = 1 and false output = NaN when condition is true (5 > 3)', () => {
    const { results } = calculate(makeIfelseGraph(5, 3, '>'));
    expect(results['ie:true']).toBe(1);
    expect(isNaN(results['ie:false'])).toBe(true);
  });

  it('true output = NaN and false output = 1 when condition is false (3 > 5)', () => {
    const { results } = calculate(makeIfelseGraph(3, 5, '>'));
    expect(isNaN(results['ie:true'])).toBe(true);
    expect(results['ie:false']).toBe(1);
  });

  it('condition < works', () => {
    expect(calculate(makeIfelseGraph(3, 5, '<')).results['ie:true']).toBe(1);
    expect(
      isNaN(calculate(makeIfelseGraph(5, 3, '<')).results['ie:true']),
    ).toBe(true);
  });

  it('condition = works (equal)', () => {
    expect(calculate(makeIfelseGraph(4, 4, '=')).results['ie:true']).toBe(1);
    expect(
      isNaN(calculate(makeIfelseGraph(4, 5, '=')).results['ie:true']),
    ).toBe(true);
  });

  it('condition >= works', () => {
    expect(calculate(makeIfelseGraph(5, 5, '>=')).results['ie:true']).toBe(1);
    expect(calculate(makeIfelseGraph(6, 5, '>=')).results['ie:true']).toBe(1);
    expect(
      isNaN(calculate(makeIfelseGraph(4, 5, '>=')).results['ie:true']),
    ).toBe(true);
  });

  it('condition <= works', () => {
    expect(calculate(makeIfelseGraph(5, 5, '<=')).results['ie:true']).toBe(1);
    expect(calculate(makeIfelseGraph(4, 5, '<=')).results['ie:true']).toBe(1);
    expect(
      isNaN(calculate(makeIfelseGraph(6, 5, '<=')).results['ie:true']),
    ).toBe(true);
  });

  it('condition != works', () => {
    expect(calculate(makeIfelseGraph(5, 3, '!=')).results['ie:true']).toBe(1);
    expect(
      isNaN(calculate(makeIfelseGraph(5, 5, '!=')).results['ie:true']),
    ).toBe(true);
  });

  it('defaults missing A and B to 0 (The Zero Rule)', () => {
    const graph: GraphState = {
      nodes: [ifelseNode('ie', '>')],
      edges: [],
    };
    // 0 > 0 = false
    const { results } = calculate(graph);
    expect(isNaN(results['ie:true'])).toBe(true);
    expect(results['ie:false']).toBe(1);
  });
});

// ─── Test Suite 6: Define Node ───────────────────────────────────────────────

describe('calcEngine — Define Node', () => {
  it('outputs the value from variables[key]', () => {
    const graph: GraphState = {
      nodes: [defineNode('def', 'exp', 0), outputNode('out')],
      edges: [edge('def', 'out')],
      variables: { exp: 50 },
    };
    const { results } = calculate(graph);
    expect(results['def']).toBe(50);
    expect(results['out']).toBe(50);
  });

  it('falls back to NodeData.value when key is not in variables', () => {
    const graph: GraphState = {
      nodes: [defineNode('def', 'exp', 42), outputNode('out')],
      edges: [edge('def', 'out')],
      variables: {},
    };
    const { results } = calculate(graph);
    expect(results['def']).toBe(42);
  });

  it('outputs 0 when no variables and NodeData.value is 0 (The Zero Rule)', () => {
    const graph: GraphState = {
      nodes: [defineNode('def', 'exp'), outputNode('out')],
      edges: [edge('def', 'out')],
    };
    const { results } = calculate(graph);
    expect(results['def']).toBe(0);
  });
});

// ─── Test Suite 7: Get Node ──────────────────────────────────────────────────

describe('calcEngine — Get Node', () => {
  it('outputs variables[key] when no trigger edge (always active)', () => {
    const graph: GraphState = {
      nodes: [getNode('g', 'exp'), outputNode('out')],
      edges: [edge('g', 'out')],
      variables: { exp: 75 },
    };
    const { results } = calculate(graph);
    expect(results['g']).toBe(75);
    expect(results['out']).toBe(75);
  });

  it('outputs variables[key] when trigger = 1 (active)', () => {
    const graph: GraphState = {
      nodes: [inputNode('trig', 1), getNode('g', 'exp')],
      edges: [edge('trig', 'g', 'trigger')],
      variables: { exp: 75 },
    };
    const { results } = calculate(graph);
    expect(results['g']).toBe(75);
  });

  it('outputs NaN when trigger = NaN (blocked path)', () => {
    const graph: GraphState = {
      nodes: [
        ifelseNode('ie', '>'), // 0 > 5 = false → true output = NaN
        inputNode('threshold', 5),
        inputNode('zero', 0),
        getNode('g', 'exp'),
      ],
      edges: [
        edge('zero', 'ie', 'a'),
        edge('threshold', 'ie', 'b'),
        edge('ie', 'g', 'trigger', 'true'), // true output (NaN) → Get trigger
      ],
      variables: { exp: 99 },
    };
    const { results } = calculate(graph);
    expect(isNaN(results['g'])).toBe(true);
  });

  it('outputs 0 when key is not in variables', () => {
    const graph: GraphState = {
      nodes: [getNode('g', 'unknown')],
      edges: [],
      variables: {},
    };
    const { results } = calculate(graph);
    expect(results['g']).toBe(0);
  });
});

// ─── Test Suite 8: Set Node ──────────────────────────────────────────────────
//
// Set fires when value input is non-NaN. No trigger/block handle.
// IfElse flow control works through NaN propagation: inactive path outputs NaN
// which propagates through downstream Get/Operator nodes, arriving at Set as
// NaN — preventing the write naturally.

describe('calcEngine — Set Node', () => {
  it('fires when value is connected and non-NaN', () => {
    const graph: GraphState = {
      nodes: [inputNode('v', 60), setNode('s', 'exp')],
      edges: [edge('v', 's', 'value')],
      variables: { exp: 50 },
    };
    const { variableUpdates } = calculate(graph);
    expect(variableUpdates['exp']).toBe(60);
  });

  it('does NOT fire when no value edge is connected', () => {
    const graph: GraphState = {
      nodes: [setNode('s', 'exp')],
      edges: [],
      variables: { exp: 50 },
    };
    const { variableUpdates } = calculate(graph);
    expect('exp' in variableUpdates).toBe(false);
  });

  it('does NOT fire when value is NaN (inactive IfElse path propagated through)', () => {
    // 0 > 5 = false → true output = NaN → NaN flows into Set value → skipped
    const graph: GraphState = {
      nodes: [
        ifelseNode('ie', '>'),
        inputNode('threshold', 5),
        inputNode('zero', 0),
        setNode('s', 'exp'),
      ],
      edges: [
        edge('zero', 'ie', 'a'),
        edge('threshold', 'ie', 'b'),
        edge('ie', 's', 'value', 'true'),
      ],
      variables: { exp: 50 },
    };
    const { variableUpdates } = calculate(graph);
    expect('exp' in variableUpdates).toBe(false);
  });

  it('fires when value arrives via active IfElse path (non-NaN)', () => {
    // 5 > 0 = true → true output = 1 → flows into Set value → fires with value 1
    const graph: GraphState = {
      nodes: [
        ifelseNode('ie', '>'),
        inputNode('five', 5),
        inputNode('zero', 0),
        setNode('s', 'flag'),
      ],
      edges: [
        edge('five', 'ie', 'a'),
        edge('zero', 'ie', 'b'),
        edge('ie', 's', 'value', 'true'),
      ],
      variables: { flag: 0 },
    };
    const { variableUpdates } = calculate(graph);
    expect(variableUpdates['flag']).toBe(1);
  });

  it('returns empty variableUpdates when no Set nodes', () => {
    const graph: GraphState = {
      nodes: [inputNode('a', 5), outputNode('out')],
      edges: [edge('a', 'out')],
    };
    const { variableUpdates } = calculate(graph);
    expect(Object.keys(variableUpdates)).toHaveLength(0);
  });
});

// ─── Test Suite 9: End-to-End Flow Control ───────────────────────────────────
//
// No trigger or block handles needed. IfElse inactive output = NaN, which
// propagates through Get (trigger) → Operator → Set value, preventing the write.

describe('calcEngine — IfElse flow control (end-to-end)', () => {
  it('false path: exp=50 > 100 is false → Set(exp) fires, Set(level) skipped', () => {
    const graph: GraphState = {
      nodes: [
        defineNode('def_exp', 'exp'),
        inputNode('thresh', 100),
        ifelseNode('ie', '>'),
        getNode('g_level', 'level'),
        inputNode('one', 1),
        operatorNode('op_lvl', '+'),
        setNode('s_level', 'level'),
        getNode('g_exp', 'exp'),
        inputNode('ten', 10),
        operatorNode('op_exp', '+'),
        setNode('s_exp', 'exp'),
      ],
      edges: [
        edge('def_exp', 'ie', 'a'),
        edge('thresh', 'ie', 'b'),
        // True path — Get gated by true output (NaN when false → propagates to Set)
        edge('ie', 'g_level', 'trigger', 'true'),
        edge('g_level', 'op_lvl', 'a'),
        edge('one', 'op_lvl', 'b'),
        edge('op_lvl', 's_level', 'value'),
        // False path — Get gated by false output (NaN when true → propagates to Set)
        edge('ie', 'g_exp', 'trigger', 'false'),
        edge('g_exp', 'op_exp', 'a'),
        edge('ten', 'op_exp', 'b'),
        edge('op_exp', 's_exp', 'value'),
      ],
      variables: { exp: 50, level: 1 },
    };

    const { variableUpdates, results } = calculate(graph);

    expect(variableUpdates['exp']).toBe(60);
    expect('level' in variableUpdates).toBe(false);
    expect(isNaN(results['op_lvl'])).toBe(true);
    expect(results['op_exp']).toBe(60);
  });

  it('true path: exp=150 > 100 is true → Set(level) fires, Set(exp) skipped', () => {
    const graph: GraphState = {
      nodes: [
        defineNode('def_exp', 'exp'),
        inputNode('thresh', 100),
        ifelseNode('ie', '>'),
        getNode('g_level', 'level'),
        inputNode('one', 1),
        operatorNode('op_lvl', '+'),
        setNode('s_level', 'level'),
        getNode('g_exp', 'exp'),
        inputNode('ten', 10),
        operatorNode('op_exp', '+'),
        setNode('s_exp', 'exp'),
      ],
      edges: [
        edge('def_exp', 'ie', 'a'),
        edge('thresh', 'ie', 'b'),
        edge('ie', 'g_level', 'trigger', 'true'),
        edge('g_level', 'op_lvl', 'a'),
        edge('one', 'op_lvl', 'b'),
        edge('op_lvl', 's_level', 'value'),
        edge('ie', 'g_exp', 'trigger', 'false'),
        edge('g_exp', 'op_exp', 'a'),
        edge('ten', 'op_exp', 'b'),
        edge('op_exp', 's_exp', 'value'),
      ],
      variables: { exp: 150, level: 1 },
    };

    const { variableUpdates } = calculate(graph);

    expect(variableUpdates['level']).toBe(2);
    expect('exp' in variableUpdates).toBe(false);
  });
});

// ─── Test Suite 10: Constant Node with Trigger ───────────────────────────────

describe('calcEngine — Constant Node with Trigger', () => {
  it('outputs its value when trigger is not connected (always active)', () => {
    const graph: GraphState = {
      nodes: [inputNode('c', 42), outputNode('out')],
      edges: [edge('c', 'out')],
    };
    const { results } = calculate(graph);
    expect(results['c']).toBe(42);
  });

  it('outputs its value when trigger = 1 (active)', () => {
    const graph: GraphState = {
      nodes: [inputNode('trig', 1), inputNode('c', 42), outputNode('out')],
      edges: [edge('trig', 'c', 'trigger'), edge('c', 'out')],
    };
    const { results } = calculate(graph);
    expect(results['c']).toBe(42);
    expect(results['out']).toBe(42);
  });

  it('outputs NaN when trigger = NaN (blocked path)', () => {
    const graph: GraphState = {
      nodes: [
        ifelseNode('ie', '>'), // 0 > 5 = false → true output = NaN
        inputNode('threshold', 5),
        inputNode('zero', 0),
        inputNode('c', 99),
        outputNode('out'),
      ],
      edges: [
        edge('zero', 'ie', 'a'),
        edge('threshold', 'ie', 'b'),
        edge('ie', 'c', 'trigger', 'true'), // inactive true → NaN → Constant blocked
        edge('c', 'out'),
      ],
    };
    const { results } = calculate(graph);
    expect(isNaN(results['c'])).toBe(true);
    // Output treats NaN as 0
    expect(results['out']).toBe(0);
  });
});
