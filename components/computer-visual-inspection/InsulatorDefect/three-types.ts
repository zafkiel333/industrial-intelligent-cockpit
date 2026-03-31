export interface InsulatorDefect {
  id: string;
  index: number; // 0 to N-1 in the string
  type: 'flashover' | 'crack' | 'contamination';
  severity: number;
}

export interface InsulatorState {
  voltage: number; // kV
  leakageCurrent: number; // mA
  humidity: number; // %
}
