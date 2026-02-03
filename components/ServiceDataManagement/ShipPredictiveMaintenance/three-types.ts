
import * as THREE from 'three';

export interface MaintenanceNode {
  id: string;
  name: string;
  health: number; // 0-100
  rul: number; // Days remaining
  position: [number, number, number];
  status: 'good' | 'warning' | 'critical';
  type: 'engine' | 'shaft' | 'propeller' | 'gearbox';
}

export interface PredictiveSceneProps {
  activeNodeId?: string;
  onNodeSelect?: (id: string) => void;
}
