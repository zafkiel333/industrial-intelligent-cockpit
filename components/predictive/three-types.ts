
import * as THREE from 'three';

export interface PmAnimatables {
  mainShaft?: THREE.Group;
  bearingL?: THREE.Mesh;
  bearingR?: THREE.Mesh;
  swingJaw?: THREE.Group;
  stressWaves?: THREE.Points[];
}

export type PmSceneType = 'jaw-crusher-pm' | 'default';
