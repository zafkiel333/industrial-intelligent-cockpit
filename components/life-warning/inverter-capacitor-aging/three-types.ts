export interface CapacitorState {
  temperature: number; // Celsius
  rippleCurrent: number; // A
  capacitance: number; // uF (microfarads)
  esr: number; // mΩ (Equivalent Series Resistance)
  voltage: number; // V
}
