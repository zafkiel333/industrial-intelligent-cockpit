export interface SteeringPumpState {
  pumpRunning: boolean;
  zeroOffset: number; // -10 to 10. 0 is perfect zero.
  rudderAngle: number; // -35 to 35
  tuningScrew: number; // -10 to 10
}
