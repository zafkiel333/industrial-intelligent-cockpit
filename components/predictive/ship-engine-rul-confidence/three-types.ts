
import * as THREE from 'three';

export interface ConfidenceAnimatables {
  engineCore?: THREE.Group;
  probabilityCloud?: THREE.Points;
  uncertaintyShells?: THREE.Mesh[];
  componentNodes?: Map<string, THREE.Mesh>;
  scannerBeam?: THREE.Mesh;
}

export type ConfidenceViewMode = 'gaussian' | 'bayesian' | 'monte-carlo';
