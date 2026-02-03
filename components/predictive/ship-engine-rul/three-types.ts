
import * as THREE from 'three';

export interface ComponentLifeState {
  id: string;
  name: string;
  remainingLife: number; // 0-1
  isHot: boolean;
}

export interface EngineRulAnimatables {
  engineBlock?: THREE.Group;
  components?: Map<string, THREE.Mesh>;
  scanningRing?: THREE.Group;
  dataPoints?: THREE.Points;
  glowLights?: THREE.PointLight[];
}
