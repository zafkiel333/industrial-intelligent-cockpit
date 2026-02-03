
import * as THREE from 'three';

export interface SevereSeaAnimatables {
  shipStern?: THREE.Group;
  propeller?: THREE.Mesh;
  waterMesh?: THREE.Mesh;
  rudder?: THREE.Mesh;
  sprayParticles?: THREE.Points;
  shockWave?: THREE.Mesh;
  stormLight?: THREE.PointLight;
}

export type SeaRiskViewMode = 'hydro-elasticity' | 'propeller-racing' | 'fatigue-stress';
