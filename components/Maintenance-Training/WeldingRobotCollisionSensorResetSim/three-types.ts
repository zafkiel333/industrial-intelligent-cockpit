export interface WeldingRobotState {
  jointAngles: [number, number, number, number, number, number]; // degrees
  isMoving: boolean;
  collisionSensorStatus: 'Normal' | 'Triggered' | 'Resetting';
  weldGunPosition: { x: number, y: number, z: number };
  targetPosition: { x: number, y: number, z: number };
  systemStatus: 'Ready' | 'Error' | 'Manual' | 'Auto';
  errorLog: string[];
}
