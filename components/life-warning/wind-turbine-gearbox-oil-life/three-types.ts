export interface GearboxOilState {
  temperature: number; // Celsius
  viscosity: number; // cSt (centistokes)
  waterContent: number; // ppm
  metallicParticles: number; // ppm (wear debris)
  operatingHours: number; // hours
}
