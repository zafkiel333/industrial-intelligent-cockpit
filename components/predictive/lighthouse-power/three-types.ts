
import * as THREE from 'three';

export interface LighthouseAnimatables {
  turbineBlades?: THREE.Group;
  beaconLight?: THREE.SpotLight;
  beaconMesh?: THREE.Mesh;
  energyParticles?: THREE.Points;
  solarPanels?: THREE.Group;
  batteryBank?: THREE.Group;
  waves?: THREE.Mesh;
}

export type PowerViewMode = 'energy-flow' | 'battery-thermal' | 'environmental-stress';
