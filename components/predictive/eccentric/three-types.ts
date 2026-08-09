
import * as THREE from 'three';

export interface EccentricAnimatables {
  eccentricShaft?: THREE.Group;
  bushing?: THREE.Mesh;
  oilParticles?: THREE.Points;
  heatGlow?: THREE.Mesh;
}

export type EccentricPmSceneType = 'eccentric-diagnostic';
