import * as THREE from 'three';

export interface ShaftAlignmentAnimatables {
  shaftSegments?: THREE.Group[];
  laserBeam?: THREE.Line;
  deviationMarkers?: THREE.Group;
  bearings?: THREE.Group[];
  stressGlow?: THREE.Mesh;
  flangeConnections?: THREE.Group[];
}

export type AlignmentDiagnosticView = 'geometric' | 'dynamic' | 'thermal';