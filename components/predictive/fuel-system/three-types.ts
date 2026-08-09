import * as THREE from 'three';

export interface FuelFluidAnimatables {
  pipeLoop?: THREE.Group;
  fuelParticles?: THREE.Points;
  pumpNodes?: THREE.Group;
  filterModules?: THREE.Group;
  heaterGlow?: THREE.PointLight;
  scanningFringe?: THREE.Mesh;
}

export type FuelSystemMode = 'hfo' | 'mdo' | 'changeover';