
export interface PropulsionPart {
  id: string;
  name: string;
  type: 'blade' | 'hub' | 'shaft' | 'gearbox' | 'thruster_pod';
  health: number; // 0-100
  vibration: number; // mm/s
  efficiency: number; // 0-1
  status: 'normal' | 'warning' | 'critical';
}

export interface PropulsionThreeProps {
  parts: PropulsionPart[];
  activePartId: string | null;
  rpm: number;
  pitchAngle: number; // 螺距角 -30 to +30
  showWake: boolean; // 是否显示尾流粒子
  onPartSelect: (id: string) => void;
}
