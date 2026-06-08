// Shared Types Definition for Dynamic Status Node Calculator
// Single Source of Truth as per REQ-6.2

export interface NodeData {
  id: string;
  type:
    | 'input'
    | 'output'
    | 'operator'
    | 'conditional'
    | 'ifelse'
    | 'define'
    | 'get'
    | 'set';
  label?: string; // Optional display name
  value: number; // Numeric stat value (user-set; ignored for output/operator/conditional)
  isPercentage: boolean; // True if value is a percentage
  operator?: '+' | '-' | '*' | '/' | 'max' | 'min'; // Only for operator nodes (math only)
  condition?: '>' | '<' | '=' | '>=' | '<=' | '!='; // Only for ifelse nodes
  variableKey?: string; // Only for define/get/set nodes
}

export interface EdgeData {
  source: string; // Source Node ID
  target: string; // Target Node ID
  sourceHandle?: string; // e.g. 'true'/'false' for IfElse, 'a'/'b' for Operator
  targetHandle?: string; // e.g. 'a', 'b', 'trigger', 'value'
}

export interface GraphState {
  nodes: NodeData[];
  edges: EdgeData[];
  variables?: Record<string, number>; // Runtime global variable values keyed by Define node key
}
