
export interface GovernorSceneProps {
  systemPressure: number; // MPa
  tankLevel: number; // %
  oilTemp: number; // Celsius, affects color
  pumpA_State: 'running' | 'standby' | 'fault';
  pumpB_State: 'running' | 'standby' | 'fault';
  accumulatorLevel: number; // %, physical piston/bladder level
  servoPosition: number; // 0-100%
}
