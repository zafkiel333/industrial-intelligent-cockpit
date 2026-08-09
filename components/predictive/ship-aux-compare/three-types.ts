
import * as THREE from 'three';

export interface AuxSystemNode {
  id: string;
  name: string;
  group: THREE.Group;
  core: THREE.Mesh;
  halo: THREE.Mesh;
  status: 'optimal' | 'stable' | 'degrading' | 'critical';
  health: number;
}

export interface AuxCompareAnimatables {
  systemNodes: AuxSystemNode[];
  connectingLines?: THREE.Line[];
  globalScanner?: THREE.Mesh;
  dataCloud?: THREE.Points;
}

export type AuxCompareViewMode = 'cluster' | 'topology' | 'heatmap';
