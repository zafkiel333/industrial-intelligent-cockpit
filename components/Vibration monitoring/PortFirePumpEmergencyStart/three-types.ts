import * as THREE from 'three';

export interface FirePumpState {
  motorSpeed: number; // rpm
  vibrationPeak: number; // mm/s
  pressure: number; // MPa
  isStarting: boolean;
  startProgress: number; // 0-1
}
