
import * as THREE from 'three';

export interface MiningSceneProps {
  onNodeClick?: (nodeId: string) => void;
  activeNodeId?: string | null;
}

export interface DataNode {
  id: string;
  position: [number, number, number];
  label: string;
  value: string;
}
