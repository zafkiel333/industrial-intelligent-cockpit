
import * as THREE from 'three';

export interface PortEntityNode {
  id: string;
  name: string;
  type: 'ship' | 'tug' | 'crane' | 'sensor';
  position: [number, number, number];
  status: 'active' | 'idle' | 'warning';
  data: string;
}

export interface BerthingSceneProps {
  shipDistance: number; // Distance to quay
  shipAngle: number; // Angle relative to quay
  tugForces: { id: string, force: number }[];
  activeEntityId?: string;
  onEntitySelect?: (id: string) => void;
}
