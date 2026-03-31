import * as THREE from 'three';

export interface SceneConfig {
  container: HTMLDivElement;
  width: number;
  height: number;
}

export interface ShaftState {
  rpm: number;
  vibrationAmplitude: number;
  phaseAngle: number;
}
