
import * as THREE from 'three';

export interface HeatExchangerAnimatables {
  shell?: THREE.Mesh;
  tubeBundle?: THREE.Group;
  hotFluidParticles?: THREE.Points;
  coldFluidParticles?: THREE.Points;
  scalingGlows?: THREE.Group;
  scanningPlane?: THREE.Mesh;
}

export type ExchangerViewMode = 'structure' | 'thermal' | 'clogging';
