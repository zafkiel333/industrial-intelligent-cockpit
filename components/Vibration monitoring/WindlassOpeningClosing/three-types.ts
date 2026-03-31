import * as THREE from 'three';

export interface WindlassState {
  speed: number; // rpm
  vibrationLevel: number; // 0-1
  isOperating: boolean;
  direction: 'up' | 'down' | 'stop';
  chainLength: number;
}
