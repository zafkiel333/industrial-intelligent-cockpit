
import * as THREE from 'three';

export interface LifecycleAnimatables {
  truckGroup?: THREE.Group;
  chassis?: THREE.Mesh;
  dumpBody?: THREE.Mesh;
  wheels?: THREE.Group[];
  rustOverlays?: THREE.Group;
  oilLeakParticles?: THREE.Points;
  scanningSphere?: THREE.Mesh;
}

export interface LifecycleMetrics {
  year: number;
  healthScore: number;
  totalCost: number;
  maintenanceRatio: number; // 预防性 vs 事后
  reliability: number;
}
