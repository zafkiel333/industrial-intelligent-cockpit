
import * as THREE from 'three';

export interface NavMarkAnimatables {
  buoyGroup?: THREE.Group;
  lightMesh?: THREE.Mesh;
  lightSource?: THREE.PointLight;
  solarPanel?: THREE.Mesh;
  waterPlane?: THREE.Mesh;
  chainLine?: THREE.Line;
  radarScanner?: THREE.Mesh;
}

export type NavMarkViewMode = 'standard' | 'mooring-strain' | 'night-vision';
