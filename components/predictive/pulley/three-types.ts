
import * as THREE from 'three';

export interface PulleyAnimatables {
  pulleyShell?: THREE.Mesh;
  laggingLayer?: THREE.Mesh;
  shaft?: THREE.Mesh;
  grooveParticles?: THREE.Points;
  sensorGlow?: THREE.PointLight;
}

export type PulleyPmSceneType = 'pulley-wear-xray';
