export interface ValveState {
  spoolPosition: number; // -1 to 1
  oilPressure: number;
  isClogged: boolean;
  flowRate: number;
}
