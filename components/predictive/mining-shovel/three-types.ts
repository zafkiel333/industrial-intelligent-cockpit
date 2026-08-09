
export interface ShovelPartStatus {
  id: string;
  name: string;
  health: number; // 0-100
  riskLevel: 'normal' | 'warning' | 'critical';
  temperature: number;
}

export interface ShovelSceneProps {
  parts: ShovelPartStatus[];
  swingAngle: number;    // 回转角度 (0-360)
  hoistHeight: number;   // 提升高度 (0-1)
  crowdDistance: number; // 推压距离 (0-1)
  bucketAngle: number;   // 铲斗倾角
  activePartId: string | null;
  onPartClick: (id: string) => void;
  showXRay: boolean;     // X光透视模式
  isScanning: boolean;   // 是否显示扫描线
}
