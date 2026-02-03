
import * as THREE from 'three';

export interface MultimodalAnimatables {
  shipGroup?: THREE.Group;
  trainGroup?: THREE.Group;
  truckGroup?: THREE.Group;
  craneGroup?: THREE.Group;
  container?: THREE.Mesh;
  dataFlow?: THREE.Points;    // Data packets
  hubNode?: THREE.Group;      // Central Data Hub
  connectionLines?: THREE.Group; // Lines connecting entities to Hub
}

export type TransportMode = 
  | 'SEA_RAIL'   // 海铁联运
  | 'SEA_ROAD'   // 海公联运
  | 'RAIL_ROAD'; // 公铁联运
