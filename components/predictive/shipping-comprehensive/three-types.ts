
import * as THREE from 'three';

export interface ShipOverviewAnimatables {
  hull?: THREE.Mesh;
  nodes?: Map<string, THREE.Group>; // Key systems nodes
  waterGrid?: THREE.GridHelper;
  scanningPlane?: THREE.Mesh;
  connectionLines?: THREE.Group;
  statusAura?: THREE.Mesh;
}

export type ShipSystemStatus = 'optimal' | 'warning' | 'critical';

export interface ShipSystemNode {
  id: string;
  position: [number, number, number];
  name: string;
  status: ShipSystemStatus;
}
