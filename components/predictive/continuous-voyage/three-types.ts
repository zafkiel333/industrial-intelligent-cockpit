
import * as THREE from 'three';

export interface FatigueAnimatables {
  shipHull?: THREE.Group;
  keelBeam?: THREE.Mesh;
  engineMounts?: THREE.Group;
  stressHotspots?: THREE.Group; // Group of points/meshes indicating fatigue
  oceanGrid?: THREE.Mesh;
  wakeTrail?: THREE.Points;
  clockRing?: THREE.Group; // Visual representation of time passing
}

export type FatigueViewMode = 'cumulative-damage' | 'crack-propagation' | 'stress-cycles';
