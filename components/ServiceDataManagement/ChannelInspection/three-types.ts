
import * as THREE from 'three';

export interface ChannelEntity {
  id: string;
  type: 'buoy' | 'beacon' | 'drone' | 'usv';
  position: [number, number, number];
  status: 'good' | 'warning' | 'critical' | 'inspecting';
  label: string;
  rotation?: number; // Y-axis rotation
}

export interface InspectionSceneProps {
  activeEntityId?: string;
  onEntitySelect?: (id: string) => void;
  waterLevel?: number; // For dynamic water height
}
