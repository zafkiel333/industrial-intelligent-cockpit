export interface InjectorState {
  fuelPressure: number; // bar
  sprayAngle: number; // degrees
  atomizationQuality: number; // % (100% is perfect mist, lower means droplets/streaming)
  operatingHours: number; // hours
  fuelImpurities: number; // ppm
}
