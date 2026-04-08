export interface DryingState {
  temperature: number; // 20 to 120 Celsius
  moisture: number; // 100 to 0 %
  isHeating: boolean;
  targetTemp: number;
}
