
import * as THREE from 'three';

export interface HydroNode {
  id: string;
  name: string;
  type: 'generator' | 'shaft' | 'turbine' | 'bearing';
  position: [number, number, number];
  status: 'optimal' | 'warning' | 'critical';
  temperature: number;
  vibration: number;
}

export interface HydroSceneProps {
  rpm: number; // Rotation speed
  load: number; // Percentage 0-100
  guideVaneOpen: number; // Percentage 0-100
  activePartId?: string;
  onPartSelect?: (id: string) => void;
}
