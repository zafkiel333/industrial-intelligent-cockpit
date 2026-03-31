export interface ShipHullState {
  vibrationAmplitude: number;
  bendingMoment: number;
  seaState: number;
  hullStress: number;
  speed: number;
  isScanning?: boolean;
}
