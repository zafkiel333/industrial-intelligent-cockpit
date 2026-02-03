
import * as THREE from 'three';

export interface SteeringAnimatables {
  tillerArm?: THREE.Group;
  leftCylinder?: THREE.Mesh;
  rightCylinder?: THREE.Mesh;
  hydraulicLines?: THREE.Group;
  flowParticles?: THREE.Points;
  scanningGlow?: THREE.Mesh;
  rudderShaft?: THREE.Mesh;
}

export type SteeringViewMode = 'standard' | 'internal-flow' | 'stress-map';
