
import * as THREE from 'three';

export interface WinchAnimatables {
  mainDrum?: THREE.Group;
  ropeLayer?: THREE.Mesh;
  motorUnit?: THREE.Mesh;
  brakeUnit?: THREE.Group;
  spoolingMechanism?: THREE.Group;
  scanningGlow?: THREE.Mesh;
  stressPoints?: THREE.Group;
}

export type WinchViewMode = 'mechanical' | 'structural' | 'thermal';
