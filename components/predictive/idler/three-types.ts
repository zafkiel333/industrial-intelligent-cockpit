
import * as THREE from 'three';

export interface IdlerAnimatables {
  shell?: THREE.Mesh;
  shaft?: THREE.Mesh;
  bearingL?: THREE.Mesh;
  bearingR?: THREE.Mesh;
  seals?: THREE.Group;
  heatGlow?: THREE.PointLight;
}

export type IdlerPmSceneMode = 'standard' | 'xray' | 'thermal';
