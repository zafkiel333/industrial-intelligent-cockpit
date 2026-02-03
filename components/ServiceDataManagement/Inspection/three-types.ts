
import * as THREE from 'three';

export interface InspectionNode {
  id: string;
  name: string;
  type: 'robot' | 'drone' | 'manual' | 'sensor';
  status: 'active' | 'anomaly' | 'idle';
  position: [number, number, number];
  dataVolume: string;
}

export interface InspectionPath {
  id: string;
  points: THREE.Vector3[];
  color: string;
}

export interface InspectionProps {
  activeNodeId?: string;
  onNodeSelect?: (id: string) => void;
}
