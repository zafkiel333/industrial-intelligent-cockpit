
import * as THREE from 'three';

export interface SensorNode {
  id: string;
  type: 'stress' | 'seepage' | 'displacement' | 'crack';
  position: [number, number, number];
  value: number;
  status: 'normal' | 'warning' | 'alarm';
  label: string;
}

export interface StructureProps {
  waterLevel: number; // 0-100% relative height
  stressLoad: number; // 0-1 Global stress intensity for heatmap
  crackGrowth: number; // 0-1 Crack propagation simulation
  activeSensorId?: string;
  onSensorSelect?: (id: string) => void;
}
