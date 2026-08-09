export interface AGVLidarState {
  agvPosition: { x: number, y: number };
  lidarAngle: number; // 0 to 360
  scanRadius: number;
  obstacles: { x: number, y: number, detected: boolean }[];
  calibrationMode: boolean;
  calibrationOffset: number; // -10 to +10 degrees
  isCalibrated: boolean;
}
