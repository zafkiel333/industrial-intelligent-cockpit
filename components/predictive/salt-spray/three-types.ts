
import * as THREE from 'three';

export interface CorrosionAnimatables {
  metalGroup?: THREE.Group;
  rustShell?: THREE.Mesh; // The rust overlay
  bolts?: THREE.Mesh[];
  saltFog?: THREE.Points; // Environmental particles
  pittingNodes?: THREE.Group; // Specific corrosion pits
  electrochemicalField?: THREE.Group; // Visualizing electron flow
}

export type CorrosionViewMode = 'visual-surface' | 'pitting-depth' | 'electrochemical';
