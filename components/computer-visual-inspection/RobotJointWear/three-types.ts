export interface RobotStatus {
  jointWear: number[]; // 6 joints
  precision: number;
  vibration: number;
  temperature: number[];
  isMoving: boolean;
  errorDetected: boolean;
}
