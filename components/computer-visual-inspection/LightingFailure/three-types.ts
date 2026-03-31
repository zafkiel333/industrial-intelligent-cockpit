export interface LightingStatus {
  totalLights: number;
  activeLights: number;
  failedLights: number;
  coverage: number; // 0 to 100
  energyConsumption: number; // kW
  isFaulty: boolean;
  faultLocations: string[];
}
