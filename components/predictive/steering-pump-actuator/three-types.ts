
import * as THREE from 'three';

export interface SteeringPAAnimatables {
  pumps?: THREE.Group[];
  actuatorCylinders?: THREE.Group;
  pistons?: THREE.Mesh[];
  hydraulicCircuit?: THREE.Group;
  leakParticles?: THREE.Points;
  scanningFringe?: THREE.Mesh;
  thermalNodes?: THREE.Group;
}

export type PADiagnosticView = 'standard' | 'xray' | 'flow-dynamic';
