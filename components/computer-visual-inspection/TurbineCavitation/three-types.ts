export interface CavitationPoint {
  id: string;
  bladeIndex: number;
  intensity: number; // 0 to 1
  position: [number, number, number];
}

export interface TurbineState {
  rpm: number;
  efficiency: number;
  vibrationLevel: number;
}
