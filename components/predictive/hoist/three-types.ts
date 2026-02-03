
import * as THREE from 'three';

export interface HoistAnimatables {
  drum?: THREE.Mesh;
  shaft?: THREE.Mesh;
  ropeL?: THREE.Line;
  ropeR?: THREE.Line;
  brakeDisc?: THREE.Mesh;
  vibrationAura?: THREE.Mesh;
  heatGlow?: THREE.PointLight;
}

export type HoistPmMode = 'holistic' | 'mechanical' | 'electrical';
