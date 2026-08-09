
import * as THREE from 'three';

export interface RtgAnimatables {
  bogieGroup?: THREE.Group;
  wheelFront?: THREE.Mesh;
  wheelRear?: THREE.Mesh;
  gearbox?: THREE.Mesh;
  motor?: THREE.Mesh;
  transmissionShaft?: THREE.Mesh;
  thermalOverlay?: THREE.Group;
  vibrationParticles?: THREE.Points;
  scanPlane?: THREE.Mesh;
}

export type RtgViewMode = 'reality' | 'thermal-map' | 'vibration-analysis';
