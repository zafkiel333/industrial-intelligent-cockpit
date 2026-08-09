export interface PropellerState {
  rotationSpeed: number;
  cavitationIntensity: number;
  damageDetected: boolean;
  damagePoints: { x: number; y: number; z: number; severity: 'low' | 'medium' | 'high' }[];
}
