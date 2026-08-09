
import * as THREE from 'three';

export interface ConeAnimatables {
  mantle?: THREE.Mesh;
  concave?: THREE.Mesh;
  particles?: THREE.Points;
  axisLines?: THREE.Group;
}

export type ConePmSceneType = 'cone-wear-analysis' | 'default';
