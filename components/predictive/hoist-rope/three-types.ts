
import * as THREE from 'three';

export interface RopeAnimatables {
  ropeHelix?: THREE.Group;
  sheave?: THREE.Mesh;
  mflSensorRing?: THREE.Group;
  defectMarkers?: THREE.Group;
  magneticFieldLines?: THREE.Group;
}

export type RopeViewMode = 'standard' | 'magnetic' | 'fatigue-map';
