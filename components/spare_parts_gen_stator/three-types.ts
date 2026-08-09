
export interface GenPart {
  id: string;
  type: 'stator-bar' | 'rotor-pole' | 'slip-ring' | 'fan-blade';
  temperature: number;
  vibration: number;
  status: 'normal' | 'warning' | 'critical';
  slotIndex?: number; // For stator bars
}

export interface GenStatorThreeProps {
  parts: GenPart[];
  activePartId: string | null;
  rpm: number;
  viewMode: 'standard' | 'thermal' | 'airgap';
  onPartSelect: (id: string) => void;
}
