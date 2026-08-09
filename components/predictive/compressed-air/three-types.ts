
import * as THREE from 'three';

export interface AirSystemAnimatables {
  compressorScrews?: THREE.Group;
  storageTank?: THREE.Mesh;
  airFlowParticles?: THREE.Points;
  leakGlows?: THREE.Group;
  pressurePulse?: THREE.Mesh;
  dryerModule?: THREE.Group;
  scanningFringe?: THREE.Mesh;
}

export type AirViewMode = 'standard' | 'pressure-field' | 'leak-detection';
