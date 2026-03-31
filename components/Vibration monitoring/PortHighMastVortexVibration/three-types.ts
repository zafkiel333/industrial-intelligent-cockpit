import * as THREE from 'three';

export interface MastState {
  windSpeed: number; // m/s
  windDirection: number; // degrees
  vibrationAmplitude: number; // mm
  isLockIn: boolean; // Resonance detection
}
