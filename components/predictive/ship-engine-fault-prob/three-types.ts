
import * as THREE from 'three';

export interface FaultProbAnimatables {
  engineGroup?: THREE.Group;
  riskNodes?: THREE.Group;
  energyFlowLines?: THREE.Group;
  probabilityAura?: THREE.Mesh;
}

export type ProbViewMode = 'bayesian' | 'weibull' | 'monte-carlo';
