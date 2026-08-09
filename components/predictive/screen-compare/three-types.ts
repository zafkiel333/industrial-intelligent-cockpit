
import * as THREE from 'three';

export interface ScreenNode {
  id: string;
  group: THREE.Group;
  mesh: THREE.Mesh;
  lightRing: THREE.Mesh;
  status: 'normal' | 'warning' | 'critical';
  health: number;
}

export interface CompareAnimatables {
  nodes: ScreenNode[];
  connectionLines?: THREE.Line[];
  scannerPlane?: THREE.Mesh;
}

export type ScreenCompareSceneType = 'fleet-health-cluster';
