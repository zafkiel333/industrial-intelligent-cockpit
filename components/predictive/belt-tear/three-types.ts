
import * as THREE from 'three';

export interface BeltTearAnimatables {
  beltSurface?: THREE.Mesh;
  steelCords?: THREE.Group;
  scannerLaser?: THREE.Mesh;
  tearPoint?: THREE.Mesh;
  sensorGlow?: THREE.PointLight;
}

export type BeltTearPmSceneType = 'belt-structural-xray';
