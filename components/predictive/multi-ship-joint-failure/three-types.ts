
import * as THREE from 'three';

export interface FleetAnimatables {
  globe?: THREE.Group;
  shipMarkers?: THREE.Group;
  connectionLines?: THREE.Group;
  dataParticles?: THREE.Points;
  scanningRing?: THREE.Mesh;
  atmosphere?: THREE.Mesh;
  satelliteRing?: THREE.Group;
}

export type FleetViewMode = 'geo-distribution' | 'correlation-network' | 'swarm-intelligence';
