
export interface BrakePadState {
  id: string;
  thickness: number; // mm
  temperature: number; // Celsius
  wearRate: number; // mm/1000km
}

export interface BrakingSceneProps {
  speed: number;             // km/h
  brakePressure: number;     // kPa (0-500)
  discTemperature: number;   // Celsius
  isEmergencyBraking: boolean;
  pads: BrakePadState[];
  viewMode: 'visual' | 'thermal' | 'stress';
}
