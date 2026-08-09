import * as THREE from 'three';

export interface LubeDeteriorationAnimatables {
  flowStream?: THREE.Group;
  contaminants?: THREE.Points;
  oxidizedLayer?: THREE.Mesh;
  laserScanner?: THREE.Mesh;
  sensorNodes?: THREE.Group;
}

export type LubeViewMode = 'viscosity' | 'contamination' | 'chemical';