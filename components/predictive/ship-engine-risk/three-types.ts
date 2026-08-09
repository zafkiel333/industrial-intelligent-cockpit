
import * as THREE from 'three';

export interface EngineRiskAnimatables {
  engineGroup?: THREE.Group;
  riskNodes?: THREE.Group;
  networkLines?: THREE.Group;
  scanPlane?: THREE.Mesh;
  atmosphereParticles?: THREE.Points;
}

export type RiskViewMode = 'probability' | 'impact' | 'connectivity';
