import * as THREE from 'three';

export interface AuxGenAnimatables {
  dieselEngine?: THREE.Group;
  alternator?: THREE.Mesh;
  coupling?: THREE.Mesh;
  magneticFluxLines?: THREE.Group;
  exhaustFlow?: THREE.Points;
  thermalGlow?: THREE.PointLight;
}

export type AuxGenStatus = 'standby' | 'running' | 'parallel' | 'warning';