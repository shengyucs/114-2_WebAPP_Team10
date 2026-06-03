import { describe, it, expect, beforeEach } from 'vitest';
import { useStore } from '../store/useStore';

describe('useStore (Zustand Store Unit Tests)', () => {
  beforeEach(() => {
    // Reset state before each test
    useStore.setState({
      nodes: [],
      edges: [],
      selectedNodeId: null,
      results: {},
    });
  });

  it('should initialize with empty state', () => {
    const state = useStore.getState();
    expect(state.nodes.length).toBe(0);
    expect(state.edges.length).toBe(0);
    expect(state.selectedNodeId).toBeNull();
  });

  it('should add a constant (input) node with size 140x75 and correct default fields', () => {
    useStore.getState().addNode('input');
    const nodes = useStore.getState().nodes;
    expect(nodes.length).toBe(1);
    expect(nodes[0].type).toBe('input');
    expect(nodes[0].data.value).toBe(0);
    expect(nodes[0].data.isPercentage).toBe(false);
    expect(nodes[0].style).toEqual({ width: 140, height: 75 });
  });

  it('should add an operator node with size 56x56 and default operator "+"', () => {
    useStore.getState().addNode('operator');
    const nodes = useStore.getState().nodes;
    expect(nodes.length).toBe(1);
    expect(nodes[0].type).toBe('operator');
    expect(nodes[0].data.operator).toBe('+');
    expect(nodes[0].style).toEqual({ width: 56, height: 56 });
  });

  it('should add a conditional node with size 70x90', () => {
    useStore.getState().addNode('conditional');
    const nodes = useStore.getState().nodes;
    expect(nodes.length).toBe(1);
    expect(nodes[0].type).toBe('conditional');
    expect(nodes[0].style).toEqual({ width: 70, height: 90 });
  });

  it('should patch node data and position correctly', () => {
    useStore.getState().addNode('input');
    const node = useStore.getState().nodes[0];

    useStore.getState().patchNode(node.id, {
      data: { value: 42, label: 'Strength' },
      position: { x: 100, y: 150 },
    });

    const updatedNode = useStore.getState().nodes[0];
    expect(updatedNode.data.value).toBe(42);
    expect(updatedNode.data.label).toBe('Strength');
    expect(updatedNode.position).toEqual({ x: 100, y: 150 });
  });

  it('should patch operator node with new operators successfully', () => {
    useStore.getState().addNode('operator');
    const node = useStore.getState().nodes[0];

    // Patch to '='
    useStore.getState().patchNode(node.id, {
      data: { operator: '=' },
    });
    expect(useStore.getState().nodes[0].data.operator).toBe('=');

    // Patch to '>='
    useStore.getState().patchNode(node.id, {
      data: { operator: '>=' },
    });
    expect(useStore.getState().nodes[0].data.operator).toBe('>=');

    // Patch to '<='
    useStore.getState().patchNode(node.id, {
      data: { operator: '<=' },
    });
    expect(useStore.getState().nodes[0].data.operator).toBe('<=');

    // Patch to '!='
    useStore.getState().patchNode(node.id, {
      data: { operator: '!=' },
    });
    expect(useStore.getState().nodes[0].data.operator).toBe('!=');
  });

  it('should delete a node and remove its associated edges', () => {
    useStore.getState().addNode('input'); // n1
    useStore.getState().addNode('output'); // n2
    const nodes = useStore.getState().nodes;
    const n1 = nodes[0].id;
    const n2 = nodes[1].id;

    useStore.setState({
      edges: [{ id: 'e1', source: n1, target: n2 }],
    });

    useStore.getState().deleteNode(n1);

    expect(useStore.getState().nodes.length).toBe(1);
    expect(useStore.getState().nodes[0].id).toBe(n2);
    expect(useStore.getState().edges.length).toBe(0);
  });

  it('should layout nodes topologically in left-to-right columns', () => {
    useStore.getState().addNode('input'); // n1
    useStore.getState().addNode('operator'); // n2
    useStore.getState().addNode('output'); // n3
    const nodes = useStore.getState().nodes;
    const n1 = nodes[0].id;
    const n2 = nodes[1].id;
    const n3 = nodes[2].id;

    // Connect n1 -> n2 -> n3
    useStore.setState({
      edges: [
        { id: 'e1', source: n1, target: n2 },
        { id: 'e2', source: n2, target: n3 },
      ],
    });

    useStore.getState().layoutNodes();

    const updatedNodes = useStore.getState().nodes;
    const node1 = updatedNodes.find((n) => n.id === n1)!;
    const node2 = updatedNodes.find((n) => n.id === n2)!;
    const node3 = updatedNodes.find((n) => n.id === n3)!;

    // Expect node1 X < node2 X < node3 X since n1 is root (level 0), n2 is level 1, n3 is level 2
    expect(node1.position.x).toBeLessThan(node2.position.x);
    expect(node2.position.x).toBeLessThan(node3.position.x);

    // With 1 node in each column, all y positions should default to 80 (offset = 0)
    expect(node1.position.y).toBe(80);
    expect(node2.position.y).toBe(80);
    expect(node3.position.y).toBe(80);
  });

  it('should center columns vertically relative to the longest column', () => {
    useStore.getState().addNode('input'); // n1 (Level 0)
    useStore.getState().addNode('input'); // n2 (Level 0)
    useStore.getState().addNode('input'); // n3 (Level 0)
    useStore.getState().addNode('output'); // n4 (Level 1)

    const nodes = useStore.getState().nodes;
    const n1 = nodes[0].id;
    const n2 = nodes[1].id;
    const n3 = nodes[2].id;
    const n4 = nodes[3].id;

    // Connect all three inputs to the output
    useStore.setState({
      edges: [
        { id: 'e1', source: n1, target: n4 },
        { id: 'e2', source: n2, target: n4 },
        { id: 'e3', source: n3, target: n4 },
      ],
    });

    useStore.getState().layoutNodes();

    const updatedNodes = useStore.getState().nodes;
    const node1 = updatedNodes.find((n) => n.id === n1)!;
    const node2 = updatedNodes.find((n) => n.id === n2)!;
    const node3 = updatedNodes.find((n) => n.id === n3)!;
    const node4 = updatedNodes.find((n) => n.id === n4)!;

    // Level 0 has 3 nodes, so N_max = 3.
    // Their y coordinates should be 80, 220, 360 (assigned in order or sorted, total set of y coords should match)
    const yCoords = [node1.position.y, node2.position.y, node3.position.y].sort(
      (a, b) => a - b,
    );
    expect(yCoords).toEqual([80, 220, 360]);

    // Level 1 has 1 node (n4), so its offset = (3 - 1) * 70 = 140
    // Its y coordinate should be 0 * 140 + 80 + 140 = 220 (vertically centered relative to the 3-node column)
    expect(node4.position.y).toBe(220);
  });
});
