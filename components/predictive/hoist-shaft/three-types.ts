
import * as THREE from 'three';

export interface ShaftAnimatables {
  mainShaft?: THREE.Mesh;
  bearingDE?: THREE.Group;
  bearingNDE?: THREE.Group;
  torqueParticles?: THREE.Points;
  stressHeatmap?: THREE.Mesh;
  coupling?: THREE.Mesh;
}

export type ShaftViewMode = 'xray' | 'stress' | 'standard';
