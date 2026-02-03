import * as THREE from 'three';

export interface SwitchboardAnimatables {
  busbars?: THREE.Group;
  contactBolts?: Map<string, THREE.Mesh>;
  thermalClouds?: THREE.Group;
  scanningRay?: THREE.Mesh;
  electronFlow?: THREE.Points;
}

export type SwitchboardViewMode = 'infrared' | 'structural' | 'electromagnetic';