
export interface GateSceneProps {
  openingHeight: number; // meters or percentage (0-100)
  waterLevelUpstream: number; // meters
  waterLevelDownstream: number; // meters
  stressMap: boolean; // toggle stress heatmap
  vibrationIntensity: number; // visual shake factor
  trunnionHealth: number; // 0-100, affects color of pivot point
}
