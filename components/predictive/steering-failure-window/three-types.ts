
import * as THREE from 'three';

export interface SteeringFailureAnimatables {
  mainTiller?: THREE.Group;
  actuatorL?: THREE.Mesh;
  actuatorR?: THREE.Mesh;
  pistonL?: THREE.Mesh;
  pistonR?: THREE.Mesh;
  timeVortex?: THREE.Group;
  riskAura?: THREE.Mesh;
  scanningFringe?: THREE.Mesh;
}

export type FailureWindowViewMode = 'stochastic' | 'structural' | 'thermal';
