import * as THREE from 'three';

export interface LubeRulAnimatables {
  screwPump?: THREE.Group;
  filterCore?: THREE.Mesh;
  oilFlowParticles?: THREE.Points;
  wearHotspots?: THREE.Group;
  pressureAura?: THREE.Mesh;
  scanningLaser?: THREE.Mesh;
}

export type LubeDiagnosticMode = 'wear' | 'efficiency' | 'cavitation';