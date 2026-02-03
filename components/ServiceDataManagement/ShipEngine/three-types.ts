
import * as THREE from 'three';

export interface EngineDataNode {
  id: string;
  name: string;
  type: 'main' | 'auxiliary' | 'control';
  loadFactor: number; // 0-1
  position: [number, number, number];
  status: 'optimal' | 'maintenance' | 'warning';
}

export interface EngineNexusProps {
  activeNodeId?: string;
  onNodeSelect?: (id: string) => void;
  rotationSpeed?: number;
}
