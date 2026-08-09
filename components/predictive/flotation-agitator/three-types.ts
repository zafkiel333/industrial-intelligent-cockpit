
import * as THREE from 'three';

export interface AgitatorAnimatables {
  mainShaft?: THREE.Mesh;
  impeller?: THREE.Group;
  stator?: THREE.Mesh;
  airBubbles?: THREE.Points;
  motor?: THREE.Mesh;
  vibrationWave?: THREE.Mesh;
}

export type AgitatorMode = 'fluid' | 'structure' | 'xray';
