
import * as THREE from 'three';

export interface SlewingAnimatables {
  slewingRing?: THREE.Group;
  pinion?: THREE.Mesh;
  pedestal?: THREE.Mesh;
  stressPoints?: THREE.Points;
  scanningRing?: THREE.Mesh;
}

export type SlewingViewMode = 'standard' | 'meshing' | 'structural';
