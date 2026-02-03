
import * as THREE from 'three';

export interface EngineFailureAnimatables {
  engineGroup?: THREE.Group;
  shaft?: THREE.Mesh;
  cylinders?: THREE.Group[];
  pistonGlows?: THREE.PointLight[];
  agingOverlay?: THREE.Mesh;
  timeLineRing?: THREE.Group;
}

export type FailurePredictionMode = 'normal' | 'accelerated' | 'monitored';
