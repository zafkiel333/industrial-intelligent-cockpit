import * as THREE from 'three';

export interface PowerLoadAnimatables {
  powerBus?: THREE.Group;
  electronFlow?: THREE.Points;
  transformerNodes?: THREE.Group;
  energyPulse?: THREE.Mesh;
  gridLines?: THREE.GridHelper;
}

export type GridStatus = 'stable' | 'fluctuating' | 'surge_risk';