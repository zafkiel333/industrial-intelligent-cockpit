
import * as THREE from 'three';

export interface SystemNode {
  id: string;
  label: string;
  type: 'electrical' | 'mechanical' | 'fluid' | 'control';
  // Use generic object structure as JSON serialization strips Vector3 methods
  position: { x: number; y: number; z: number }; 
  status: 'normal' | 'warning' | 'critical';
  connections: string[]; // IDs of downstream nodes
}

export interface PropagationAnimatables {
  nodeGroup?: THREE.Group;
  linkGroup?: THREE.Group;
  pulseParticles?: THREE.Points;
  impactWaves?: THREE.Group;
  gridFloor?: THREE.GridHelper;
}

export type SimStatus = 'idle' | 'propagating' | 'contained';
