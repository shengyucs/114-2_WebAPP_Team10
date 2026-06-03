import { describe, it, expect } from 'vitest';
import LZString from 'lz-string';
import type { GraphState } from '../../../shared/types';

describe('sharing — LZ-String Compression and Decompression', () => {
  it('correctly compresses and decompresses a graph state without data loss', () => {
    const originalState: GraphState = {
      nodes: [
        {
          id: '1',
          type: 'input',
          label: 'Base Damage',
          value: 100,
          isPercentage: false,
        },
        {
          id: '2',
          type: 'operator',
          label: 'Multiplier',
          value: 0,
          isPercentage: false,
          operator: '*',
        },
        {
          id: '3',
          type: 'output',
          label: 'Total Output',
          value: 0,
          isPercentage: false,
        },
      ],
      edges: [
        { source: '1', target: '2', targetHandle: 'a' },
        { source: '2', target: '3' },
      ],
    };

    const serialized = JSON.stringify(originalState);
    const compressed = LZString.compressToEncodedURIComponent(serialized);

    // Ensure compressed string is shorter or at least compact, and URL safe
    expect(compressed).toBeTypeOf('string');
    expect(compressed.length).toBeGreaterThan(0);
    expect(compressed).not.toContain(' ');
    expect(compressed).not.toContain('/');

    const decompressed = LZString.decompressFromEncodedURIComponent(compressed);
    expect(decompressed).toBe(serialized);

    const restoredState: GraphState = JSON.parse(decompressed!);
    expect(restoredState).toEqual(originalState);
  });
});
