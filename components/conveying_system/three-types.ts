
export interface ConveyorPartNode {
  id: string;
  name: string;
  type: 'belt' | 'motor' | 'roller' | 'pulley' | 'tensioner';
  health: number; // 0-100
  load: number; // 0-1
  position: [number, number, number];
}

export interface ConveyingThreeProps {
  parts: ConveyorPartNode[];
  activeId: string | null;
  onSelect: (id: string) => void;
  speed: number;
  viewMode: 'standard' | 'xray' | 'thermal';
}
