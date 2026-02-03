
import * as THREE from 'three';

export interface SedimentAnimatables {
  riverBed?: THREE.Mesh;         // Original terrain
  sedimentMesh?: THREE.Mesh;     // The accumulation layer
  waterSurface?: THREE.Mesh;
  suspendedParticles?: THREE.Points;
  sectionSlicer?: THREE.Group;   // Visual plane for cross-section
  gridHelper?: THREE.GridHelper;
}

export interface SedimentSimState {
  year: number;          // Current selected year
  accumulationFactor: number; // 0.0 to 1.0 (Height scaler)
  isSlicing: boolean;    // Whether slice mode is active
  slicePosition: number; // Z position of slice
}
