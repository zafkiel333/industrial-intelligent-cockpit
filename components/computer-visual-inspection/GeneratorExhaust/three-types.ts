export interface ExhaustStatus {
  smokeColor: string; // 'normal' | 'black' | 'white' | 'blue'
  opacity: number; // 0 to 1
  co2Level: number; // ppm
  noxLevel: number; // ppm
  efficiency: number; // 0 to 100
  isAbnormal: boolean;
  engineRpm: number;
}
