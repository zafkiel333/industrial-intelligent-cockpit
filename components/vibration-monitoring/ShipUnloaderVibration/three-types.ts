export interface UnloaderState {
  hoistSpeed: number; // m/s
  trolleyPosition: number; // 0-1 (normalized)
  vibrationIntensity: number; // 0-1
  grabLoad: number; // tons
  windSpeed: number; // m/s
}
