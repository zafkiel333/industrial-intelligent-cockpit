export interface BoilerState {
  steamPressure: number;
  vibrationIntensity: number;
  waterLevel: number;
  burnerStatus: 'normal' | 'warning' | 'error';
  temperature: number;
}
