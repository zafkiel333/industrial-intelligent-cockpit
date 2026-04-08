export interface PIDTuningState {
  setpoint: number; // Target position %
  processVariable: number; // Actual position %
  controlOutput: number; // Output to valve %
  kp: number; // Proportional gain
  ki: number; // Integral gain
  kd: number; // Derivative gain
  isAuto: boolean;
  history: { time: number; sp: number; pv: number; out: number }[];
  time: number;
}
