
export interface InsulationPoint {
  position: [number, number, number];
  intensity: number; // 0-1, PD intensity
}

export interface MotorInsulationSceneProps {
  rotationSpeed: number; // RPM
  windingTemp: number; // Celsius
  pdIntensity: number; // Partial Discharge Level (pC)
  insulationHealth: number; // 0-100%
  viewMode: 'standard' | 'thermal' | 'electric-field';
  isRunning: boolean;
}
