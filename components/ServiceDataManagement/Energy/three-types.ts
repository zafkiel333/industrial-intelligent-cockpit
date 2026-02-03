
import * as THREE from 'three';

export interface EnergyNode {
  id: string;
  name: string;
  loadLevel: number; // 0-1
  type: 'source' | 'consumption';
  position: [number, number, number];
  serviceYield: string; // 如：2.4t/kWh
}

export interface EnergyFluxProps {
  activeNodeId?: string;
  onNodeSelect?: (id: string) => void;
  systemIntensity: number;
}
