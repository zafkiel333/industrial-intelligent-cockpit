export interface BearingState {
  rpm: number;
  oilTemp: number;
  waterFlow: number;
  padTemps: number[];
  faultType: 'none' | 'water_loss' | 'oil_contamination';
}
