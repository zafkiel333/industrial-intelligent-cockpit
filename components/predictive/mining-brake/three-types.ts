
export interface BrakeComponent {
  id: string;
  name: string;
  temp: number;      // Celsius
  wear: number;      // 0-100%
  status: 'normal' | 'warning' | 'critical';
}

export interface BrakeSceneProps {
  rotationSpeed: number; // RPM
  brakePressure: number; // Bar (0-200)
  temperature: number;   // Global assembly temp
  isBraking: boolean;    // Visual trigger for clamping/sparks
  wearLevel: number;     // 0-1 (Global wear)
  viewMode: 'thermal' | 'mechanical' | 'wear';
}
