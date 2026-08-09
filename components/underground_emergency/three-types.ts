
export interface UndergroundNode {
  id: string;
  depth: number; // 深度，单位米
  type: 'pump' | 'hoist' | 'conveyor' | 'ventilation';
  status: 'critical' | 'warning' | 'normal';
  position: [number, number, number];
}

export interface UndergroundThreeProps {
  nodes: UndergroundNode[];
  activeNodeId: string | null;
  onNodeSelect: (id: string) => void;
  showScanEffect: boolean;
}
