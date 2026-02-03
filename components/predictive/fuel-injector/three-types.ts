import * as THREE from 'three';

export interface InjectorAnimatables {
  plunger?: THREE.Mesh;
  needleValve?: THREE.Mesh;
  nozzleBody?: THREE.Mesh;
  sprayParticles?: THREE.Points;
  pressureAura?: THREE.Mesh;
  wearHotspots?: THREE.Group;
}

export type InjectorDiagnosticView = 'xray' | 'flow' | 'stress';