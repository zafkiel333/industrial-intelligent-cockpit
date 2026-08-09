
import * as THREE from 'three';

export interface CylinderLinerAnimatables {
  linerBody?: THREE.Mesh;
  pistonRingGhost?: THREE.Mesh;
  laserScanner?: THREE.Group;
  wearHotspots?: THREE.Group;
  coolingJacket?: THREE.Mesh;
}

export type LinerViewMode = 'thickness' | 'scuffing' | 'thermal';
