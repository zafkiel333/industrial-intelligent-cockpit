
import * as THREE from 'three';

export interface LinerAnimatables {
  shellSection?: THREE.Group;
  linerGroup?: THREE.Group;
  scanningLine?: THREE.Mesh;
  particleImpacts?: THREE.Points;
  sensorHeads?: THREE.Group;
}

export type LinerViewMode = 'thickness' | 'stress' | 'xray';
