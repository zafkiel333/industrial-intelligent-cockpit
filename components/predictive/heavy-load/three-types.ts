
import * as THREE from 'three';

export interface HeavyLoadAnimatables {
  shipGroup?: THREE.Group;
  propeller?: THREE.Mesh;
  containerStack?: THREE.Group;
  seaMesh?: THREE.Mesh;
  wakeParticles?: THREE.Points;
  stressOverlay?: THREE.Mesh;
  exhaust?: THREE.Points;
}

export type LoadViewMode = 'hydrodynamics' | 'structural-stress' | 'engine-load';
