
import * as THREE from 'three';

export interface SystemNode {
  id: string;
  name: string;
  type: 'source' | 'processor' | 'consumer';
  position: THREE.Vector3;
  status: 'normal' | 'warning' | 'critical' | 'failed';
  connections: string[]; // IDs of downstream nodes
}

export interface CascadeAnimatables {
  nodeGroup?: THREE.Group;
  linkLines?: THREE.Line[];
  pulseParticles?: THREE.Group;
  shockwaves?: THREE.Group;
  gridFloor?: THREE.GridHelper;
}

export type FailureMode = 'none' | 'cooling_loss' | 'power_blackout' | 'fuel_cut';
