
import * as THREE from 'three';

export interface TrolleyAnimatables {
  trolleyGroup?: THREE.Group;
  wheels?: THREE.Mesh[];
  hoistDrum?: THREE.Mesh;
  ropes?: THREE.Line;
  spreader?: THREE.Mesh;
  railLeft?: THREE.Mesh;
  railRight?: THREE.Mesh;
  scanningGrid?: THREE.GridHelper;
  wearHeatmap?: THREE.Group;
}

export type TrolleyViewMode = 'mechanical' | 'wear-profile' | 'stress-field';
