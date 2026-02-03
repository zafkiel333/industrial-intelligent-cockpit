import * as THREE from 'three';

export interface ShaftSystemAnimatables {
  mainShaft?: THREE.Group;
  propeller?: THREE.Group;
  bearings?: THREE.Group[];
  alignmentLine?: THREE.Line;
  waterRipples?: THREE.Points;
  stressHeatMap?: THREE.Mesh;
}

export type ShaftDiagnosticView = 'alignment' | 'vibration' | 'thermal';