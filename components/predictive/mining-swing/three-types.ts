
export interface SwingPart {
  id: string;
  name: string;
  type: 'motor' | 'gear' | 'bearing' | 'brake';
  health: number; // 0-100
  temp: number;   // 摄氏度
  vibration: number; // mm/s
  stress: number;    // 0-1 归一化应力
}

export interface SwingSceneProps {
  parts: SwingPart[];
  rpm: number;           // 回转速度
  torque: number;        // 实时扭矩
  viewMode: 'mechanical' | 'thermal' | 'magnetic';
  activePartId: string | null;
  onPartSelect: (id: string) => void;
}
