
export interface PumpPartStatus {
  id: string;
  name: string;
  health: number; // 0-100
  wearDepth: number; // 磨损深度 mm
  temp: number;
  // Fix: Added missing riskLevel property to support status indicators in the predictive maintenance view
  riskLevel: 'normal' | 'warning' | 'critical';
}

export interface PumpSceneProps {
  parts: PumpPartStatus[];
  rpm: number;              // 驱动转速
  swashPlateAngle: number;  // 斜盘角度 (0-20度)
  pressure: number;         // 实时压力 MPa
  isInternalVisible: boolean; // 是否显示内部透视
  isCavitating: boolean;    // 是否发生气蚀（显示气泡）
  selectedPartId: string | null;
  onPartSelect: (id: string) => void;
}
