export interface MainShaftData {
  timestamp: string;
  displacementX: number; // μm
  displacementY: number; // μm
  phaseAngle: number; // degrees
  vibrationVelocity: number; // mm/s
  guideBearingTemp: number; // °C
  activePower: number; // MW
}
