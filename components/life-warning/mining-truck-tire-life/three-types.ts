export interface TireState {
  pressure: number; // psi or kPa
  temperature: number; // Celsius
  treadDepth: number; // mm
  load: number; // tons
  tkph: number; // Ton-Kilometers Per Hour (heat generation index)
  operatingHours: number; // hours
}
