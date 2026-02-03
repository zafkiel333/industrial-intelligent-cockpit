
import * as THREE from 'three';

export interface PistonAnimatables {
  pistonGroup?: THREE.Group;
  crown?: THREE.Mesh;
  rings?: THREE.Mesh[];
  coolingOilPoints?: THREE.Points;
  heatGlow?: THREE.PointLight;
  carbonOverlay?: THREE.Mesh;
}

export type PistonViewMode = 'mechanical' | 'thermal' | 'lubrication';
