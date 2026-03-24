export interface SluiceGateProps {
  gateOpening: number; // 0-100%
  motorCurrent: number; // Amps
  vibration: number; // mm/s
  isAlert: boolean;
}
