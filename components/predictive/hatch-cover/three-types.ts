
import * as THREE from 'three';

export interface HatchAnimatables {
  panels?: THREE.Group[];
  cylinders?: THREE.Group[];
  pistons?: THREE.Mesh[];
  hingePoints?: THREE.Group;
  sealStripGlow?: THREE.Mesh;
  scanningFringe?: THREE.Mesh;
  forceVectors?: THREE.ArrowHelper[];
}

export type HatchState = 'closed' | 'opening' | 'open' | 'stuck';
