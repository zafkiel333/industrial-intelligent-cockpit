
import * as THREE from 'three';

export interface ImpactAnimatables {
  rotorBody?: THREE.Group;
  blowBars?: THREE.Mesh[];
  crackPoints?: THREE.Points;
  stressField?: THREE.Mesh;
}

export type ImpactPmSceneType = 'impact-rotor-analysis';
