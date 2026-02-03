
export interface GatePart {
  id: string;
  type: 'seal' | 'cylinder' | 'trunnion' | 'skin_plate' | 'hoist_unit';
  health: number; // 0-100
  status: 'normal' | 'warning' | 'critical';
  label: string;
}

export interface GateHoistThreeProps {
  parts: GatePart[];
  selectedPartId: string | null;
  gateOpening: number; // 0-1 (0 = closed, 1 = fully open)
  waterLevel: number; // 0-1 relative to gate height
  isCorrosionView: boolean;
  onPartSelect: (id: string) => void;
}
