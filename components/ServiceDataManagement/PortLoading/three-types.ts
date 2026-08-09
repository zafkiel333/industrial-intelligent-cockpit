
import * as THREE from 'three';

export interface PortEquipmentNode {
  id: string;
  type: 'sts' | 'agv' | 'armg';
  position: [number, number, number];
  status: 'operating' | 'maintenance' | 'idle';
  load?: boolean; // Is it carrying a container?
  label: string;
}

export interface PortSceneProps {
  activeEquipmentId?: string;
  onSelect?: (id: string) => void;
  efficiency: number; // Controls animation speed
}
