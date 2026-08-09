
export interface SafetySensorNode {
  id: string;
  name: string;
  type: 'gas' | 'stress' | 'dust' | 'seismic' | 'uwb';
  position: [number, number, number];
  health: number; // 0-100
  signalStrength: number; // dBm
  lastCalibration: string;
  isIntrinsicallySafe: boolean;
}

export interface MineSafetyThreeProps {
  sensors: SafetySensorNode[];
  activeSensorId: string | null;
  onSelect: (id: string) => void;
  mineDepth: number; // 模拟下潜深度
  alertLevel: 'normal' | 'warning' | 'critical';
}
