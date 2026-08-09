
import * as THREE from 'three';

export interface ScreenWearAnimatables {
  meshSurface?: THREE.Mesh;
  particleSystem?: THREE.Points;
  cloggingNodes?: THREE.Group;
  scannerBeam?: THREE.Mesh;
}

export type ScreenWearPmSceneType = 'screen-wear-clogging-analysis';
