
import * as THREE from 'three';

export type NodeType = 'pump-station' | 'aqueduct' | 'tunnel' | 'sluice' | 'reservoir';

export interface WaterNode {
  id: string;
  name: string;
  type: NodeType;
  distance: number; // Chainage distance (km) along the route
  status: 'normal' | 'warning' | 'maintenance' | 'offline';
  waterLevel: number;
  flow: number;
}

export interface CrossRegionSceneProps {
  activeNodeId?: string;
  onNodeSelect?: (id: string) => void;
  flowVelocity: number; // 0-2 scale
  waterQualityIndex: number; // Visual clarity of water
}
