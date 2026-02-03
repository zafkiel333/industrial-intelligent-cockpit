
export interface LocoComponent {
  id: string;
  name: string;
  temp: number;
  status: 'normal' | 'warning' | 'critical';
}

export interface LocomotiveSceneProps {
  speed: number;             // km/h
  pantographHeight: number;  // 0-1 (Extension)
  isSparking: boolean;       // Pantograph arcing
  brakeTemp: number;         // Celsius
  motorTemp: number;         // Celsius
  viewMode: 'standard' | 'thermal' | 'xray';
  trackCurvature: number;    // -1 (Left) to 1 (Right)
}
