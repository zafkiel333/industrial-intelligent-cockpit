import * as THREE from 'three';

export interface BearingVibTempAnimatables {
  outerRace?: THREE.Mesh;
  innerRace?: THREE.Group;
  rollers?: THREE.Group;
  oilSpray?: THREE.Points;
  heatAura?: THREE.Mesh;
  vibrationIndicator?: THREE.Line;
}

export type BearingDiagnosticState = 'idle' | 'nominal' | 'degrading' | 'critical';