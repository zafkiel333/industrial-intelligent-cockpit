import * as THREE from 'three';

export interface FuelLeakAnimatables {
  pipeNetwork?: THREE.Group;
  flowParticles?: THREE.Points;
  leakEmitters?: THREE.Points[];
  clogZones?: THREE.Group;
  pressureMarkers?: THREE.Group;
  scannerAura?: THREE.Mesh;
}

export type LeakDiagnosticView = 'pressure' | 'flow' | 'structural';