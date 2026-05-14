// Shared Types Definition for Dynamic Status Node Calculator
// Single Source of Truth as per REQ-6.2

export interface NodeData {
  id: string;
  type: 'input' | 'output' | 'buff';
  multiplierZone: string; // Identifier for the calculation zone
  value: number; // Numeric stat value
  isPercentage: boolean; // True if value is a percentage
  startTime?: number; // Active start time for buffs
  endTime?: number; // Active end time for buffs
}

export interface EdgeData {
  source: string; // Source Node ID
  target: string; // Target Node ID
}

export interface GraphState {
  nodes: NodeData[];
  edges: EdgeData[];
}
