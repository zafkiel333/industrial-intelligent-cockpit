
import * as THREE from 'three';

export interface CraneAnimatables {
  gantry?: THREE.Group;
  boom?: THREE.Group;
  trolley?: THREE.Group;
  spreader?: THREE.Group;
  ropes?: THREE.Group;
  container?: THREE.Mesh;
  scanningLaser?: THREE.Mesh;
  stressPoints?: THREE.Group;
}

export type CraneViewMode = 'operation' | 'structural' | 'drive-train';
