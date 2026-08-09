export interface ServoRepairState {
  robotAngle: number;
  isPowerOff: boolean;
  isCoverRemoved: boolean;
  isCableDisconnected: boolean;
  isMotorRemoved: boolean;
  isNewMotorInstalled: boolean;
  isCableConnected: boolean;
  isCoverInstalled: boolean;
  isCalibrated: boolean;
  currentStep: number;
}
