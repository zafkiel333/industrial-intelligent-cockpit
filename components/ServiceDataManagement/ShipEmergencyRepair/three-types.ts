
import * as THREE from 'three';

export interface IncidentMarker {
  id: string;
  position: [number, number, number];
  type: 'fire' | 'mechanical' | 'electrical' | 'leak';
  severity: 'critical' | 'high' | 'medium';
  label: string;
}

export interface RepairSceneProps {
  activeIncidentId?: string;
  onIncidentSelect?: (id: string) => void;
  alertLevel?: number; // 0 (calm) to 1 (critical) used for pulse speed
}
