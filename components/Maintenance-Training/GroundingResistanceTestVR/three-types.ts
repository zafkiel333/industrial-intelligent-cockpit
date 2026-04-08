export interface GroundingState {
  testVoltage: number; // V
  testCurrent: number; // mA
  measuredResistance: number; // Ohms
  soilResistivity: number; // Ohm-m (environmental factor)
  probeDistanceE: number; // m (Earth probe)
  probeDistanceP: number; // m (Potential probe)
  probeDistanceC: number; // m (Current probe)
  isTesting: boolean;
  connectionStatus: {
    E: boolean;
    P: boolean;
    C: boolean;
  };
  weatherCondition: 'Dry' | 'Normal' | 'Wet';
}
