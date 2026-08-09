
import * as THREE from 'three';

export interface EquipmentNode {
  id: string;
  name: string;
  position: [number, number, number]; // Relative to ship center
  gLoad: number; // Current G-force
  limit: number; // G-force limit
  status: 'safe' | 'warning' | 'danger';
}

export interface SeaConditionProps {
  waveHeight: number; // Significant Wave Height (Hs)
  wavePeriod: number; // Peak Period (Tp)
  shipMotion: {
    roll: number;
    pitch: number;
    heave: number;
  };
  activeNodeId?: string;
  onNodeSelect?: (id: string) => void;
}
