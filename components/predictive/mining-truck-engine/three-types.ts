
export interface CylinderStatus {
  id: number;
  temp: number; // Exhaust Gas Temp (C)
  pressure: number; // Peak Firing Pressure (bar)
  injection: number; // Injection timing offset (ms)
  health: number; // 0-100
}

export interface EngineSceneProps {
  rpm: number;
  cylinders: CylinderStatus[];
  turboSpeed: number; // RPM
  viewMode: 'thermal' | 'mechanical' | 'exploded';
  activeCylinder: number | null;
  onCylinderSelect: (id: number) => void;
  vibrationIntensity: number;
}
