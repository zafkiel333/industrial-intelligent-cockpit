
import * as THREE from 'three';

export interface ExciterAnimatables {
  shaftA?: THREE.Group;
  shaftB?: THREE.Group;
  casing?: THREE.Mesh;
  vibrationGhost?: THREE.Mesh;
  forceVector?: THREE.ArrowHelper;
}

export type ExciterPmSceneType = 'exciter-dynamics-analysis';
