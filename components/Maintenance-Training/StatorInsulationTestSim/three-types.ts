export interface InsulationState {
  voltage: number;
  resistance: number;
  isTesting: boolean;
  probePosition: { x: number, y: number, z: number };
}
