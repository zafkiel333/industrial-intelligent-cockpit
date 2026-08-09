export interface GuideVaneData {
  timestamp: string;
  servoStroke: number; // mm
  servoOilPressure: number; // MPa
  ringAngle: number; // Degree of regulating ring
  vaneAngles: number[]; // Array of 4 key quadrant vanes in degrees
  frictionTorque: number; // kN.m - friction in the bearings
  shearPinStress: number; // MPa - force on the shear pin (剪断销)
  flowVelocity: number; // m/s
  turbineRpm: number; // RPM
  overallStatus: 'normal' | 'warning' | 'danger';
}
