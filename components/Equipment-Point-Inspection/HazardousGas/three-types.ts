export interface HazardousGasProps {
  ch4Level: number; // % LEL (Methane)
  coLevel: number; // ppm (Carbon Monoxide)
  ventilationRate: number; // m³/min
  isAlert: boolean;
}
