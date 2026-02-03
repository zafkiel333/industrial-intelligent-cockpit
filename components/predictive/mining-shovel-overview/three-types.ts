
export interface ShovelPart {
  id: string;
  name: string;
  health: number; // 0-100
  temp: number; // 摄氏度
  vibration: number; // mm/s
  stress: number; // 0-1 归一化应力
  status: 'normal' | 'warning' | 'critical';
}

export interface ShovelOverviewSceneProps {
  parts: ShovelPart[];
  swingAngle: number;
  hoistExtension: number;
  crowdExtension: number;
  viewMode: 'hologram' | 'thermal' | 'mechanical';
  activePartId: string | null;
  onPartClick: (id: string) => void;
  isScanning: boolean;
}
