import * as THREE from 'three';

export interface ElectricalFailureAnimatables {
  nodes?: Map<string, THREE.Group>;
  powerLines?: THREE.Group;
  glitchEffect?: THREE.Mesh;
  energyCore?: THREE.Mesh;
  scanningSphere?: THREE.Mesh;
}

export type FailureDiagnosticView = 'topology' | 'waveform' | 'thermal';