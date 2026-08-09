export interface ReeferState {
  suctionPressure: number; // psi
  dischargePressure: number; // psi
  compressorRunning: boolean;
  valvePlateIntact: boolean;
  refrigerantLevel: number; // 0-100%
  temperature: number; // Celsius
  powerSupply: boolean;
  isLeaking: boolean;
}
