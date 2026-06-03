// Shared Types Definition for Dynamic Status Node Calculator
// Single Source of Truth as per REQ-6.2

export interface NodeData {
  id: string;
  type: 'input' | 'output' | 'operator' | 'conditional';
  label?: string; // Optional display name
  value: number; // Numeric stat value (user-set; ignored for output/operator/conditional)
  isPercentage: boolean; // True if value is a percentage
  operator?:
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
    | '!='; // Only for operator nodes
}

export interface EdgeData {
  source: string; // Source Node ID
  target: string; // Target Node ID
  sourceHandle?: string; // e.g. 'a', 'b' for Operator Node A/B inputs
  targetHandle?: string;
}

export interface GraphState {
  nodes: NodeData[];
  edges: EdgeData[];
}
