
import * as THREE from 'three';

export interface ThickenerAnimatables {
  motorBody?: THREE.Mesh;
  gearboxShell?: THREE.Mesh;
  planetaryGears?: THREE.Group;
  mainShaft?: THREE.Mesh;
  torqueAura?: THREE.Group;
  stressParticles?: THREE.Points;
}

export type DriveViewMode = 'solid' | 'xray' | 'stress';
