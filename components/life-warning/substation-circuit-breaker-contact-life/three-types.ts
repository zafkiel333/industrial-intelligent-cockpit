export interface CircuitBreakerState {
  contactWear: number; // %
  arcCount: number; // number of operations
  temperature: number; // Celsius
  contactResistance: number; // micro-ohms
  operatingHours: number; // hours
}
