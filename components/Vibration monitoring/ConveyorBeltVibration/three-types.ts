export interface ConveyorDrumData {
  drumVibration: number;
  motorVibration: number;
  beltSpeed: number;
  beltTension: number;
  bearingTemp: number;
  slipRatio: number;
  healthStatus: 'optimal' | 'warning' | 'critical';
}
