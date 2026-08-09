
import * as THREE from 'three';

export interface BrakeAnimatables {
  disc?: THREE.Mesh;
  shoeLeft?: THREE.Group;
  shoeRight?: THREE.Group;
  hydraulicLines?: THREE.Group;
  heatGlow?: THREE.Mesh;
  pistonL?: THREE.Mesh;
  pistonR?: THREE.Mesh;
}

export type BrakeViewMode = 'mechanical' | 'hydraulic' | 'thermal';
