
import * as THREE from 'three';

export interface ShipEngineAnimatables {
  pistons?: THREE.Group[];
  crankshaft?: THREE.Group;
  turbocharger?: THREE.Group;
  combustionGlows?: THREE.PointLight[];
  exhaustParticles?: THREE.Points;
  hullFrame?: THREE.Mesh;
}

export type EngineViewMode = 'xray' | 'thermal' | 'mechanical';
