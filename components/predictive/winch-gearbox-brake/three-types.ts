
import * as THREE from 'three';

export interface WinchGearboxAnimatables {
  mainShaft?: THREE.Group;
  planetGears?: THREE.Group;
  sunGear?: THREE.Mesh;
  brakeDisc?: THREE.Mesh;
  brakeShoeL?: THREE.Mesh;
  brakeShoeR?: THREE.Mesh;
  oilMist?: THREE.Points;
  thermalGlow?: THREE.PointLight;
}

export type WinchSystemMode = 'mechanical' | 'thermal' | 'diagnostic';
