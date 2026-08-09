export interface MainEngineState {
  rpm: number;
  vibrationIntensity: number;
  torque: number;
  temperature: number;
  cylinderPressure: number[];
}
