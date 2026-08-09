
export interface TurbinePart {
  id: string;
  type: 'runner' | 'guide_vane' | 'shaft' | 'bearing' | 'casing';
  health: number; // 0-100
  stress: number; // 0-1 (Mechanical Stress)
  cavitation: number; // 0-1 (Cavitation Risk)
}

export interface TurbineThreeProps {
  parts: TurbinePart[];
  activePartId: string | null;
  rpm: number;
  flowRate: number; // 0-1
  onPartSelect: (id: string) => void;
}
