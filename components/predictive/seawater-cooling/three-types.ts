
import * as THREE from 'three';

export interface SeawaterCoolingAnimatables {
  pipeSection?: THREE.Mesh;
  scalingLayer?: THREE.Mesh;
  bioFoulingSpots?: THREE.Group;
  waterParticles?: THREE.Points;
  corrosionPits?: THREE.Group;
  scanningFringe?: THREE.Mesh;
}

export type SeawaterDiagnosticView = 'fouling' | 'corrosion' | 'chemistry';
