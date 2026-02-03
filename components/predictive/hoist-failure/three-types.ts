
import * as THREE from 'three';

export interface HoistFailureAnimatables {
  mainAssembly?: THREE.Group;
  shaft?: THREE.Mesh;
  motor?: THREE.Mesh;
  timeRings?: THREE.Group;
  scanningLight?: THREE.PointLight;
  atmosphereGrid?: THREE.GridHelper;
}

export type PredictionMode = 'optimistic' | 'standard' | 'pessimistic';
