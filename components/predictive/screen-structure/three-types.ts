
import * as THREE from 'three';

export interface StructureAnimatables {
  boxFrame?: THREE.Group;
  sidePlates?: THREE.Mesh[];
  crossBeams?: THREE.Group;
  boltMarkers?: THREE.Group;
  scanRing?: THREE.Mesh;
  crackOverlay?: THREE.Group;
}

export type StructurePmSceneType = 'screen-box-diagnostics';
