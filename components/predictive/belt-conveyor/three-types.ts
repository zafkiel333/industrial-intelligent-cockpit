
import * as THREE from 'three';

export interface BeltAnimatables {
  beltMesh?: THREE.Mesh;
  idlers?: THREE.Group;
  drivePulley?: THREE.Mesh;
  tailPulley?: THREE.Mesh;
  materialParticles?: THREE.Points;
  heatOverlay?: THREE.Mesh;
}

export type BeltPmSceneType = 'conveyor-line-comprehensive';
