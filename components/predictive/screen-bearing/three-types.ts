
import * as THREE from 'three';

export interface BearingAnimatables {
  outerRing?: THREE.Mesh;
  innerRing?: THREE.Group;
  rollers?: THREE.Group;
  stressField?: THREE.Points;
  damageNodes?: THREE.Group;
}

export type BearingPmSceneType = 'bearing-fatigue-analysis';
