
export interface ResourceNode {
  id: string;
  type: 'warehouse' | 'turbine' | 'logistics';
  position: [number, number, number];
  status: 'active' | 'loading' | 'critical';
  label: string;
}

export interface SupplyFlow {
  fromId: string;
  toId: string;
  intensity: number; // 0-1 流量强度
  color: string;
}

export interface CoordinationThreeProps {
  nodes: ResourceNode[];
  flows: SupplyFlow[];
  activePhase: 'shutdown' | 'disassembly' | 'repair' | 'startup';
}
