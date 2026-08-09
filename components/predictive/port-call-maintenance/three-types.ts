
import * as THREE from 'three';

export interface PortMapAnimatables {
  earthGroup?: THREE.Group;
  shipMarker?: THREE.Mesh;
  routeLine?: THREE.Line;
  portMarkers?: THREE.Group;
  riskAtmosphere?: THREE.Mesh;
  satellites?: THREE.Group;
}

export interface PortNode {
  id: string;
  name: string;
  lat: number;
  lon: number;
  type: 'Major' | 'Minor' | 'Destination';
  capabilities: string[];
}

export type ViewMode = 'global' | 'route' | 'risk';
