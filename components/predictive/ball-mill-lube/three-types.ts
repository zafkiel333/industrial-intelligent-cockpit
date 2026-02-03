
import * as THREE from 'three';

export interface LubeAnimatables {
  trunnion?: THREE.Mesh;
  bearingShell?: THREE.Mesh;
  oilFilm?: THREE.Mesh;
  oilParticles?: THREE.Points;
  pressureHeatmap?: THREE.Group;
}

export type LubeViewMode = 'mechanical' | 'fluid' | 'xray';
