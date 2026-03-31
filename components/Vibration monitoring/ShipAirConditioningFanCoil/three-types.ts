import * as THREE from 'three';

export interface FanCoilState {
  fanSpeed: number; // rpm
  vibrationIntensity: number; // 0-1
  temperature: number; // °C
  isAbnormal: boolean;
}
