
import * as THREE from 'three';

export interface BallMillAnimatables {
  shell?: THREE.Group;
  girthGear?: THREE.Mesh;
  pinion?: THREE.Mesh;
  bearingL?: THREE.Group;
  bearingR?: THREE.Group;
  materialParticles?: THREE.Points;
  shellAura?: THREE.Mesh;
}

export type MillViewMode = 'xray' | 'thermal' | 'mechanical';
