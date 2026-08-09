export interface SteeringGearState {
  pump1Active: boolean;
  pump2Active: boolean;
  rudderAngle: number; // -35 to +35 degrees
  targetAngle: number;
  hydraulicPressure: number; // bar
  oilLevel: number; // %
  filterClogged: boolean;
}
