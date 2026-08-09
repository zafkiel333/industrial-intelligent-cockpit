
import * as THREE from 'three';

export interface SteeringJamAnimatables {
  tillerGroup?: THREE.Group;
  ramLeft?: THREE.Mesh;
  ramRight?: THREE.Mesh;
  cylinderLeft?: THREE.Mesh;
  cylinderRight?: THREE.Mesh;
  jammingSparkles?: THREE.Points;
  scanningRing?: THREE.Mesh;
  pressurePulse?: THREE.Mesh;
}

export type JamDiagnosticView = 'mechanical' | 'hydraulic' | 'thermal';
