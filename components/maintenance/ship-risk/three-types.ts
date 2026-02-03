
import * as THREE from 'three';

export interface RiskAnimatables {
  shipHull?: THREE.Group;
  engineHotspot?: THREE.Group;
  pumpHotspot?: THREE.Group;
  rudderHotspot?: THREE.Group;
  scanningPulse?: THREE.Mesh;
  dataBeams?: THREE.Group;
  environmentFog?: THREE.FogExp2;
}

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface RiskNode {
  id: string;
  name: string;
  level: RiskLevel;
  pos: THREE.Vector3;
  color: number;
}
