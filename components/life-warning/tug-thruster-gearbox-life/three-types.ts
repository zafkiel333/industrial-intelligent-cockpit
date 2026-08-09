export interface ThrusterGearboxState {
  inputSpeed: number; // RPM
  torque: number; // kN.m
  oilTemp: number; // Celsius
  metalParticles: number; // ppm
  operatingHours: number; // hours
}
