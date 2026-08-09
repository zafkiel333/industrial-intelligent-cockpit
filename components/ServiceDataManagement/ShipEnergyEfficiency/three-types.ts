
import * as THREE from 'three';

export interface EfficiencyNode {
  id: string;
  name: string;
  type: 'consumer' | 'recovery' | 'resistance';
  efficiency: number; // 0-100%
  energyFlow: number; // kW
  position: [number, number, number];
  status: 'optimal' | 'loss' | 'harvesting';
}

export interface EnergyStream {
  id: string;
  path: THREE.Vector3[];
  color: string;
  speed: number;
}

export interface ShipEfficiencyProps {
  activeNodeId?: string;
  onNodeSelect?: (id: string) => void;
  trimAngle: number; // Ship trim visualization
  whrsActive: boolean; // Waste Heat Recovery System status
}
