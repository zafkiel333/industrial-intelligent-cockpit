
import * as THREE from 'three';

export interface GearboxAnimatables {
  casing?: THREE.Mesh;
  gears?: THREE.Group;
  shafts?: THREE.Group;
  thermalGlow?: THREE.PointLight;
  vibrationGhost?: THREE.Group;
}

export type GearboxViewMode = 'solid' | 'xray' | 'thermal';
