export interface BuoyStatus {
  pitch: number;
  roll: number;
  yaw: number;
  heave: number;
  isLanternOn: boolean;
  batteryLevel: number;
  solarPower: number;
}

export interface BuoyInspectionPoint {
  id: string;
  name: string;
  status: 'normal' | 'warning' | 'error';
  lastChecked: string;
  position: [number, number, number];
}
