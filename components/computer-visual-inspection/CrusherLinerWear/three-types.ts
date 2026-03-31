export interface LinerWear {
  id: string;
  position: [number, number, number];
  thickness: number; // mm
  wearRate: number; // mm/1000h
  severity: 'low' | 'medium' | 'high';
}

export interface CrusherState {
  throughput: number; // t/h
  power: number; // kW
  vibration: number; // mm/s
}
