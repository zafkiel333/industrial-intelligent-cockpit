import * as THREE from 'three';

export interface FailureAnalysisAnimatables {
  nodeGroup?: THREE.Group;
  flowLines?: THREE.Group;
  glitchOverlay?: THREE.Mesh;
  hologramScanner?: THREE.Mesh;
  dataPoints?: THREE.Points;
}

export type FailureSystemZone = 'generation' | 'distribution' | 'propulsion' | 'auxiliary';