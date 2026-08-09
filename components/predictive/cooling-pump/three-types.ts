
import * as THREE from 'three';

export interface CoolingPumpAnimatables {
  volute?: THREE.Mesh;
  impeller?: THREE.Group;
  shaft?: THREE.Mesh;
  flowParticles?: THREE.Points;
  cavitationBubbles?: THREE.Points;
  suctionPipe?: THREE.Mesh;
  dischargePipe?: THREE.Mesh;
  heatIndicator?: THREE.PointLight;
}

export type PumpViewMode = 'standard' | 'xray' | 'thermal';
