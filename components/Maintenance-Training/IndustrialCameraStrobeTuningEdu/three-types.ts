export interface IndustrialCameraState {
  strobeFrequency: number; // Hz
  strobeDuration: number; // microseconds
  cameraExposure: number; // microseconds
  conveyorSpeed: number; // m/s
  imageBrightness: number; // 0-255
  imageSharpness: number; // 0-100%
  isSynchronized: boolean;
  triggerMode: 'Internal' | 'External';
  triggerDelay: number; // microseconds
}
