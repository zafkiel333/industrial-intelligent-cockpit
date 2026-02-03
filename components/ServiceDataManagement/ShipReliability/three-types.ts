
import * as THREE from 'three';

export interface ReliabilityNode {
  id: string;
  name: string;
  reliability: number; // 0-1 (R(t))
  criticality: 'high' | 'medium' | 'low';
  type: 'core' | 'subsystem' | 'component';
  position: [number, number, number];
  dependencies: string[]; // IDs of nodes this node depends on
}

export interface ReliabilitySceneProps {
  activeNodeId?: string;
  onNodeSelect?: (id: string) => void;
  simulationTime: number; // 0 to 1, simulating future projection
}
