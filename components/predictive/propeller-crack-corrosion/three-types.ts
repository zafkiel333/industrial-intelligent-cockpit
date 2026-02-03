import * as THREE from 'three';

export interface PropellerPmAnimatables {
  propellerGroup?: THREE.Group;
  blades?: THREE.Mesh[];
  hub?: THREE.Mesh;
  waterParticles?: THREE.Points;
  crackMarkers?: THREE.Group;
  cavitationBubbles?: THREE.Points;
}

export type PropellerDiagnosticView = 'surface' | 'internal' | 'electrochemical';