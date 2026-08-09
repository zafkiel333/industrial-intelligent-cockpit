
import * as THREE from 'three';

export interface IncidentPoint {
  id: string;
  name: string;
  position: [number, number, number];
  type: 'thermal' | 'mechanical' | 'electrical';
  severity: number; // 0-1, controls pulse speed/size
  description: string;
}

export interface IncidentSceneProps {
  activeIncidentId?: string;
  onIncidentSelect?: (id: string) => void;
  isReplaying: boolean; // Controls animation state (normal -> fail)
  playbackTime: number; // 0 to 1
}
