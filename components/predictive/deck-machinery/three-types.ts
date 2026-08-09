
import * as THREE from 'three';

export interface DeckFailureAnimatables {
  mainDrum?: THREE.Group;
  gearbox?: THREE.Mesh;
  hydraulicPipes?: THREE.Group;
  failureNodes?: THREE.Group;
  scanningFringe?: THREE.Mesh;
  dataFlow?: THREE.Points;
}

export type FailureDiagnosticView = 'structural' | 'thermal' | 'acoustic';
