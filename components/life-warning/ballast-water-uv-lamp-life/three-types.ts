export interface UVLampState {
  uvIntensity: number; // W/m2
  flowRate: number; // m3/h
  transmittance: number; // % (UVT)
  ignitionCycles: number; // count
  operatingHours: number; // hours
}
