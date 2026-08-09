
import * as THREE from 'three';

export interface SteeringRulAnimatables {
  pumpUnit?: THREE.Group;
  ramCylinders?: THREE.Group;
  pistonLeft?: THREE.Mesh;
  pistonRight?: THREE.Mesh;
  mainTiller?: THREE.Mesh;
  healthGlows?: Map<string, THREE.PointLight>;
  scanningPlane?: THREE.Mesh;
  dataFlowParticles?: THREE.Points;
}

export type RulComponentId = 'pump' | 'seal' | 'bearing' | 'tiller';
