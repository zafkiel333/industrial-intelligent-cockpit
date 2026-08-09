import * as THREE from 'three';

export interface HullState {
  bendingAmplitude: number; // 0-1
  frequency: number; // Hz
  stressLevel: number; // 0-1
  waveHeight: number; // m
}
