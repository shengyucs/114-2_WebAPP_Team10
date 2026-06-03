import { describe, it, expect } from 'vitest';
import type { Node, Edge, Connection } from 'reactflow';
import { wouldIntroduceCycle } from '../utils/cycleDetection';

describe('cycleDetection — wouldIntroduceCycle', () => {
  it('detects a self-loop (connecting a node to itself)', () => {
    const nodes: Node[] = [
      {
        id: '1',
        position: { x: 0, y: 0 },
        data: { label: 'Node 1', value: 0, isPercentage: false },
      },
    ];
    const edges: Edge[] = [];
    const connection: Connection = {
      source: '1',
      target: '1',
      sourceHandle: null,
      targetHandle: null,
    };

    expect(wouldIntroduceCycle(nodes, edges, connection)).toBe(true);
  });

  it('detects a simple 2-node cycle', () => {
    const nodes: Node[] = [
      {
        id: '1',
        position: { x: 0, y: 0 },
        data: { label: 'Node 1', value: 0, isPercentage: false },
      },
      {
        id: '2',
        position: { x: 0, y: 0 },
        data: { label: 'Node 2', value: 0, isPercentage: false },
      },
    ];
    const edges: Edge[] = [{ id: 'e1-2', source: '1', target: '2' }];
    const connection: Connection = {
      source: '2',
      target: '1',
      sourceHandle: null,
      targetHandle: null,
    };

    expect(wouldIntroduceCycle(nodes, edges, connection)).toBe(true);
  });

  it('detects a longer cycle (A -> B -> C -> A)', () => {
    const nodes: Node[] = [
      {
        id: 'A',
        position: { x: 0, y: 0 },
        data: { label: 'A', value: 0, isPercentage: false },
      },
      {
        id: 'B',
        position: { x: 0, y: 0 },
        data: { label: 'B', value: 0, isPercentage: false },
      },
      {
        id: 'C',
        position: { x: 0, y: 0 },
        data: { label: 'C', value: 0, isPercentage: false },
      },
    ];
    const edges: Edge[] = [
      { id: 'eA-B', source: 'A', target: 'B' },
      { id: 'eB-C', source: 'B', target: 'C' },
    ];
    const connection: Connection = {
      source: 'C',
      target: 'A',
      sourceHandle: null,
      targetHandle: null,
    };

    expect(wouldIntroduceCycle(nodes, edges, connection)).toBe(true);
  });

  it('allows safe connection that does not form a cycle (multiple paths but acyclic)', () => {
    const nodes: Node[] = [
      {
        id: 'A',
        position: { x: 0, y: 0 },
        data: { label: 'A', value: 0, isPercentage: false },
      },
      {
        id: 'B',
        position: { x: 0, y: 0 },
        data: { label: 'B', value: 0, isPercentage: false },
      },
      {
        id: 'C',
        position: { x: 0, y: 0 },
        data: { label: 'C', value: 0, isPercentage: false },
      },
    ];
    const edges: Edge[] = [{ id: 'eA-B', source: 'A', target: 'B' }];
    // Connecting A -> C and B -> C is completely safe (DAG with multiple paths to C)
    const connection1: Connection = {
      source: 'A',
      target: 'C',
      sourceHandle: null,
      targetHandle: null,
    };
    expect(wouldIntroduceCycle(nodes, edges, connection1)).toBe(false);

    const edges2: Edge[] = [...edges, { id: 'eA-C', source: 'A', target: 'C' }];
    const connection2: Connection = {
      source: 'B',
      target: 'C',
      sourceHandle: null,
      targetHandle: null,
    };
    expect(wouldIntroduceCycle(nodes, edges2, connection2)).toBe(false);
  });
});
