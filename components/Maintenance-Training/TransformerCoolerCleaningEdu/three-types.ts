export interface CoolerState {
  dirtLevel: number; // 0 to 100
  isCleaning: boolean;
  waterSprayPos: { x: number, y: number };
}
