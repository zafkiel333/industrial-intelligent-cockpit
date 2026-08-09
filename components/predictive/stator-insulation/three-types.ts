import * as THREE from 'three';

export interface StatorAnimatables {
  statorCore?: THREE.Mesh;
  windingBars?: THREE.Group;
  leakageGlows?: THREE.Group;
  scanningRing?: THREE.Mesh;
  fluxParticles?: THREE.Points;
}

export type InsulationViewMode = 'ohmic' | 'discharge' | 'thermal';