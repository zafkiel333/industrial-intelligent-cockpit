
export interface HydraulicPartNode {
  id: string;
  name: string;
  type: 'pump' | 'valve' | 'accumulator' | 'hose' | 'seal';
  pressure: number; // MPa
  temperature: number; // Celsius
  health: number; // 0-100
  position: [number, number, number];
}

export interface MineHydraulicThreeProps {
  parts: HydraulicPartNode[];
  activeId: string | null;
  onSelect: (id: string) => void;
  isPumping: boolean;
  pressureFluctuation: number; // 模拟压力波动
}
