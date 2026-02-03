export interface CriticalPartNode {
  id: string;
  name: string;
  score: number; // 关键度评分 0-100
  riskLevel: 'critical' | 'high' | 'medium' | 'low';
  position: [number, number, number];
  category: string;
}

export interface CriticalThreeProps {
  parts: CriticalPartNode[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  isRotating: boolean;
}