export interface ThrustBearingData {
  timestamp: string;
  axialLoad: number; // kN
  oilPressure: number; // MPa
  padTemperatures: number[]; // °C
  oilFilmThickness: number; // μm
  coolingWaterFlow: number; // L/min
  overallStatus: 'normal' | 'warning' | 'danger';
}
