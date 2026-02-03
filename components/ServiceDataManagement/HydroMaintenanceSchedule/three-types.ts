
import * as THREE from 'three';

export interface HydroUnitNode {
  id: string;
  name: string;
  position: [number, number, number];
  status: 'running' | 'maintenance' | 'planned' | 'standby';
  progress: number; // 0-100 if in maintenance
  nextWindow: string; // Date string
}

export interface CraneNode {
  id: string;
  position: [number, number, number];
  status: 'idle' | 'moving' | 'lifting';
  targetUnitId?: string;
}

export interface MaintenanceSceneProps {
  activeUnitId?: string;
  onUnitSelect?: (id: string) => void;
  simulationDay: number; // 0-30 days forecast
}
