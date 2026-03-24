export interface VentilationDoorProps {
  airPressureDiff: number;
  doorStatus: number; // 0 to 100 (percentage open)
  gasConcentration: number;
  isAlert: boolean;
}
