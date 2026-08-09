export interface BoilerState {
  waterLevel: number; // 0 to 100%
  burnerStatus: 'off' | 'purge' | 'ignition' | 'firing' | 'lockout';
  steamPressure: number; // bar
  flameSensor: boolean;
  fuelValve: boolean;
  airFan: boolean;
}
