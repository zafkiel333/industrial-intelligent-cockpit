
import * as THREE from 'three';

export interface HydroSystemNode {
  id: string;
  name: string;
  type: 'stator' | 'rotor' | 'bearing' | 'runner' | 'volute';
  position: [number, number, number];
  status: 'normal' | 'warning' | 'critical';
  temp?: number;
  vibration?: number;
}

export interface HydroSystemProps {
  rpm: number;
  wicketGateOpening: number; // 0-100%
  waterFlow: number; // m3/s
  activeNodeId?: string;
  onNodeSelect?: (id: string) => void;
}
