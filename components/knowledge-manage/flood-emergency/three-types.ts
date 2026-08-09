
import * as THREE from 'three';

export interface FloodDrillAnimatables {
  terrain?: THREE.Mesh;
  waterPlane?: THREE.Mesh;
  rainParticles?: THREE.Points;
  damGate?: THREE.Group;
  evacuationRoutes?: THREE.Group;
  dangerZones?: THREE.Group; // Areas that turn red when flooded
  markers?: THREE.Sprite[];
}

export type DrillPhase = 
  | 'IDLE'           // Scenario loaded, waiting
  | 'PLAYING'        // Simulation running
  | 'PAUSED'         // Paused analysis
  | 'CRITICAL_EVENT' // Peak flood moment
  | 'RECOVERY';      // Water receding
