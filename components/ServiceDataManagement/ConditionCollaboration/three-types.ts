
import * as THREE from 'three';

export interface MechanicalNode {
  id: string;
  name: string;
  type: 'gear' | 'bearing' | 'shaft' | 'housing';
  position: [number, number, number];
  stress: number; // 0-1
  temp: number; // Celsius
  serviceStatus: 'protected' | 'vulnerable' | 'servicing';
}

export interface ConditionSceneProps {
  loadFactor: number; // 0-1.5 (1.0 is rated)
  envSeverity: number; // 0-1 (Dust/Heat/Vib composite)
  activeNodeId?: string;
  onNodeSelect?: (id: string) => void;
}
