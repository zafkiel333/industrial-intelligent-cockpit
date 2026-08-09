import * as THREE from 'three';

export interface TypicalFailureAnimatables {
  engineSkeleton?: THREE.Group;
  failureNodes?: Map<string, THREE.Group>;
  dataPipes?: THREE.Group;
  scanningLight?: THREE.Mesh;
  hologramGrid?: THREE.GridHelper;
}

export type FailureDiagnosticView = 'structural' | 'thermal' | 'acoustic';