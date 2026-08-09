export interface WindlassState {
  chainSpeed: number;
  vibrationIntensity: number;
  motorTorque: number;
  tension: number;
  brakeTemp: number;
  isOperating: boolean;
  operationMode: 'ANCHOR_UP' | 'ANCHOR_DOWN' | 'STOP';
}
